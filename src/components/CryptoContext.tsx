import { createContext, Dispatch, PropsWithChildren, SetStateAction, useState } from "react";
import { CollectionItem, getOrCreateCollection } from "~/helpers/api";
import { fetchAndDecryptFile, fetchAndDecryptString } from "~/helpers/encryption";

type ContextType = {
  key: CryptoKey | null;
  setKey: Dispatch<SetStateAction<CryptoKey | null>>;
  collection: CollectionItem | null;
  getImage: (collection: string, image: string, refresh?: boolean) => Promise<ImageInformation>;
  getCollection: (collection: string, refresh?: boolean) => Promise<CollectionItem>;
  closeCollection: () => void;
};

export const CryptoContext = createContext<ContextType>({
  key: null,
  setKey: () => void 0,
  collection: null,
  getImage: () => new Promise(() => void 0),
  getCollection: () => new Promise(() => void 0),
  closeCollection: () => void 0,
});

export type ImageInformation = {
  url: string;
  name: string;
  type: string;
  description: string;
  size: number;
  index: number;
  previous: string | null;
  next: string | null;
};

export default function CryptoContextProvider({ children }: PropsWithChildren<{}>) {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [collection, setCollection] = useState<CollectionItem | null>(null);
  const [imageCache, setImageCache] = useState<Record<string, ImageInformation>>({});

  async function getCollection(collectionName: string, refresh = false) {
    if (collection === null || collectionName !== collection.name || refresh) {
      const collectionItem = await getOrCreateCollection(collectionName);

      setCollection(collectionItem);
      setImageCache({});

      return collectionItem;
    }

    return collection;
  }

  async function getImage(collectionName: string, imageName: string, refresh = false) {
    if (key === null) {
      throw Error("No crypto key defined.");
    }

    const collection = await getCollection(collectionName);
    const cacheKey = `${collectionName}/${imageName}`;
    const cachedImage = imageCache?.[cacheKey];

    if (!refresh && typeof cachedImage !== "undefined") {
      return cachedImage;
    }

    const index = collection.files.indexOf(imageName);
    const [file, description] = await Promise.all([
      fetchAndDecryptFile(key, collection.iv, collection.name, imageName),
      fetchAndDecryptString(key, collection.iv, collection.name, `.${imageName}`),
    ]);

    if (file === null) {
      throw Error("Error while fetching the image.");
    }

    const url = URL.createObjectURL(file);

    const imageInformation: ImageInformation = {
      url,
      name: file.name,
      size: file.size,
      type: file.type,
      previous: index >= 0 ? collection.files[index - 1] ?? null : null,
      next: index >= 0 ? collection.files[index + 1] ?? null : null,
      index,
      description,
    };

    setImageCache((prevState) => ({
      ...prevState,
      [cacheKey]: imageInformation,
    }));

    return imageInformation;
  }

  return (
    <CryptoContext.Provider
      value={{
        key,
        setKey,
        collection,
        getCollection,
        getImage,
        closeCollection: () => {
          setCollection(null);
          setImageCache({});
          setKey(null);
        },
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
}
