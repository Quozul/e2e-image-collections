import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { CryptoContext } from "~/contexts/CryptoContext";
import { CollectionItem } from "~/helpers/api";
import { CacheContext } from "~/contexts/CacheContext";
import { WorkerContext } from "~/contexts/WorkerContext";
import { Image, Message } from "~/workers/UploadWorker";

export function useFile(collectionName: string, imageName: string, load = true): Image | null {
  const { key, iv } = useContext(CryptoContext);
  const { cache } = useContext(CacheContext);
  const { uploadWorker } = useContext(WorkerContext);

  const [isLoaded, setIsLoaded] = useState(false);
  const [file, setFile] = useState<Image | null>(null);

  const cacheKey = `${collectionName}/${imageName}`;

  useEffect(() => {
    if (cacheKey in cache && file === null) {
      setFile(cache[cacheKey]);
    } else if (key !== null && iv !== null && !isLoaded && load) {
      setIsLoaded(true);
      const message: Message = { collection: collectionName, files: { imageName, collectionName }, iv, key };
      uploadWorker.postMessage(message);
    }
  }, [cacheKey, key, iv, cache, load, isLoaded]);

  return file;
}

export default function useImage(collection: CollectionItem, imageName: string, load = true) {
  const file = useFile(collection.name, imageName!, load);
  const [dimensions, setDimensions] = useState("");

  const visibleFiles = collection.files.filter((file) => !file.startsWith("."));
  const indexInCollection = visibleFiles.indexOf(imageName);
  const previous = indexInCollection >= 0 ? visibleFiles[indexInCollection - 1] ?? null : null;
  const next = indexInCollection >= 0 ? visibleFiles[indexInCollection + 1] ?? null : null;

  return {
    file,
    onImageLoad: ({ currentTarget }: SyntheticEvent<HTMLImageElement>) => {
      setDimensions(`${currentTarget.naturalWidth ?? 0} × ${currentTarget.naturalHeight ?? 0}`);
    },
    formattedFileSize:
      file?.fileSize.toLocaleString(undefined, {
        style: "unit",
        unit: "byte",
        unitDisplay: "narrow",
        notation: "compact",
      }) ?? "N/A",
    dimensions,
    fileName: file?.fileName ?? imageName,
    indexInCollection,
    previousImageUrl: indexInCollection <= 0 ? null : `/collection/${collection.name}/image/${previous}`,
    nextImageUrl: indexInCollection >= visibleFiles.length - 1 ? null : `/collection/${collection.name}/image/${next}`,
    shouldDisplayDimensions: file?.fileType.startsWith("image/") ?? false,
  };
}

/*function useDescription(collectionName: string, imageName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { key, collection } = useContext(CryptoContext);
  const [image, setImage] = useState<ImageInformation | null>(null);
  const [newDescription, setNewDescription] = useState<string>("");
  const [dimensions, setDimensions] = useState("");
  const { file, description, refresh, url } = useFile(collection!.files, collectionName, imageName);

  useEffect(() => {
    setNewDescription(description ?? "");
  }, [description]);

  return {
    url,
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
        const file = await encryptString(key, extractBytesFromString(atob(collection.iv)), newDescription, `.${imageName}`);

        await uploadFile(String(collectionName), [file]);

        refresh();
      }
    },
    setNewDescription,
    isLoading,
    newDescription,
    previousImageUrl: image === null ? "#" : `/collection/${collectionName}/image/${image.previous}`,
    nextImageUrl: image === null ? "#" : `/collection/${collectionName}/image/${image.next}`,
  };
}*/
