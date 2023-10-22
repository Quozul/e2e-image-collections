import { createContext, Dispatch, PropsWithChildren, SetStateAction, useState } from "react";
import { CollectionItem } from "~/helpers/api";

type Image = {
  id: string;
  encryptedFileBuffer: ArrayBuffer;
  encryptedDescriptionBuffer: ArrayBuffer | null;
};

type Context = {
  collection: CollectionItem | null;
  setCollection: Dispatch<SetStateAction<CollectionItem | null>>;
};

const defaultValue: Context = {
  collection: null,
  setCollection: () => void 0,
};

export const CollectionContext = createContext<Context>(defaultValue);

export default function CollectionProvider({ children }: PropsWithChildren<{}>) {
  const [collection, setCollection] = useState<CollectionItem | null>(null);

  return <CollectionContext.Provider value={{ collection, setCollection }}>{children}</CollectionContext.Provider>;
}
