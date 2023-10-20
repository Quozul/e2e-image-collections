import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { CryptoContext, ImageInformation } from "~/components/CryptoContext";
import { encryptString, extractBytesFromString } from "~/helpers/encryption";
import { uploadFile } from "~/helpers/api";

export default function useImage(collectionName: string, imageName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { key, collection, getImage } = useContext(CryptoContext);
  const [image, setImage] = useState<ImageInformation | null>(null);
  const [newDescription, setNewDescription] = useState<string>("");
  const [dimensions, setDimensions] = useState("");

  async function refresh(refresh = false) {
    getImage(String(collectionName), imageName, refresh)
      .then(setImage)
      .catch(() => {
        setImage(null);
      });
  }

  useEffect(() => {
    refresh();
  }, [collectionName, imageName, key]);

  useEffect(() => {
    setNewDescription(image?.description ?? "");
  }, [image]);

  return {
    image:
      image === null
        ? null
        : {
            ...image,
            size:
              image?.size.toLocaleString(undefined, {
                style: "unit",
                unit: "byte",
                unitDisplay: "narrow",
                notation: "compact",
              }) ?? "N/A",
          },
    onImageLoad: ({ currentTarget }: SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      setDimensions(`${currentTarget.naturalWidth ?? 0} × ${currentTarget.naturalHeight ?? 0}`);
    },
    dimensions,
    isNewDescription: image?.description !== newDescription,
    updateDescription: async () => {
      if (image === null || collection === null || key === null) return;

      if (image.description !== newDescription) {
        const file = await encryptString(key, extractBytesFromString(collection.iv), newDescription, `.${imageName}`);

        await uploadFile(String(collectionName), file);

        await refresh(true);
      }
    },
    setNewDescription,
    isLoading,
    newDescription,
    previousImageUrl: image === null ? "#" : `/collection/${collectionName}/image/${image.previous}`,
    nextImageUrl: image === null ? "#" : `/collection/${collectionName}/image/${image.next}`,
  };
}
