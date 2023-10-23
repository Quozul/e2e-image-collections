import { createContext, Dispatch, PropsWithChildren, SetStateAction, useState } from "react";

type ContextType = {
  key: CryptoKey | null;
  iv: Uint8Array | null;
  setKey: Dispatch<SetStateAction<CryptoKey | null>>;
  setIv: Dispatch<SetStateAction<Uint8Array | null>>;
};

export const CryptoContext = createContext<ContextType>({
  key: null,
  iv: null,
  setKey: () => void 0,
  setIv: () => void 0,
});

export default function CryptoContextProvider({ children }: PropsWithChildren<{}>) {
  const [iv, setIv] = useState<Uint8Array | null>(null);
  const [key, setKey] = useState<CryptoKey | null>(null);

  return (
    <CryptoContext.Provider
      value={{
        key,
        setKey,
        iv,
        setIv,
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
}
