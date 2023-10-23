import { createContext, PropsWithChildren, useState } from "react";
import { Image } from "~/workers/UploadWorker";

type Context = {
  cache: Record<string, Image>;
  setCache: (key: string, file: Image) => void;
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
        setCache: (key: string, file: Image) => {
          setCache((prevState) => ({
            ...prevState,
            [key]: file,
          }));
        },
      }}
    >
      {children}
    </CacheContext.Provider>
  );
}
