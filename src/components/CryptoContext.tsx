import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from "react";
import {
  CollectionItem,
  getOrCreateCollection,
} from "./collection/collection.ts";
import {
  decryptFileName,
  fetchAndDecryptImage,
} from "../helpers/encryption.ts";

type ContextType = {
  key: CryptoKey | null;
  setKey: Dispatch<SetStateAction<CryptoKey | null>>;
  collection: CollectionItem | null;
  getImage: (collection: string, image: string) => Promise<ImageInformation>;
  getCollection: (collection: string) => Promise<CollectionItem>;
  closeCollection: () => void;
};

export const CryptoContext = createContext<ContextType>({
  key: null,
  setKey: () => void 0,
  collection: null,
  getImage: () => void 0,
  getCollection: () => void 0,
  closeCollection: () => void 0,
});

export type ImageInformation = {
  url: string;
  name: string;
};

export default function CryptoContextProvider({
  children,
}: PropsWithChildren<{}>) {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [collection, setCollection] = useState<CollectionItem | null>(null);
  const [imageCache, setImageCache] = useState<
    Record<string, ImageInformation>
  >({});

  async function getCollection(collectionName: string, refresh = false) {
    if (collection === null || collectionName !== collection.name || refresh) {
      const collectionItem = await getOrCreateCollection(collectionName);

      setCollection(collectionItem);

      return collectionItem;
    }

    return collection;
  }

  async function getImage(collectionName: string, imageName: string) {
    const collection = await getCollection(collectionName);

    const cacheKey = `${collectionName}/${imageName}`;

    const cachedImage = imageCache?.[cacheKey];

    if (typeof cachedImage !== "undefined") {
      return cachedImage;
    }

    const url = await fetchAndDecryptImage(
      key,
      collection.iv,
      collection.name,
      imageName,
    );

    const name = await decryptFileName(key, collection.iv, imageName);

    const imageInformation: ImageInformation = { url, name };

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
