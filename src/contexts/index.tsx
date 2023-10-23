import { PropsWithChildren } from "react";
import CryptoContextProvider from "~/contexts/CryptoContext";
import CacheProvider from "~/contexts/CacheContext";
import CollectionProvider from "~/contexts/CollectionContext";
import WorkerProvider from "~/contexts/WorkerContext";

export default function ContextProvider({ children }: PropsWithChildren<{}>) {
  return (
    <CryptoContextProvider>
      <CacheProvider>
        <WorkerProvider>
          <CollectionProvider>{children}</CollectionProvider>
        </WorkerProvider>
      </CacheProvider>
    </CryptoContextProvider>
  );
}
