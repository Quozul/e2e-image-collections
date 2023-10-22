import { createContext, PropsWithChildren, useState } from "react";

type Image = {
  encryptedFileBuffer: ArrayBuffer | null;
  encryptedDescriptionBuffer: ArrayBuffer | null;
  decryptedFileBuffer: File | null;
  decryptedDescriptionBuffer: string | null;
  url: string | null;
};

type Context = {
  cache: Record<string, Image>;
  setCache: (key: string, image: Image) => void;
};

const defaultValue: Context = {
  cache: {},
  setCache: () => void 0,
};

export const CacheContext = createContext<Context>(defaultValue);

export default function CacheProvider({ children }: PropsWithChildren<{}>) {
  const [cache, setCache] = useState<Record<string, Image>>({});

  return (
    <CacheContext.Provider
      value={{
        cache,
        setCache: (key: string, image: Image) => {
          setCache((prevState) => ({
            ...prevState,
            [key]: image,
          }));
        },
      }}
    >
      {children}
    </CacheContext.Provider>
  );
}
