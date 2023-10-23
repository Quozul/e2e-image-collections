import { createContext, PropsWithChildren, useMemo } from "react";
import DownloadWorker from "~/workers/UploadWorker?worker";

type Context = {
  uploadWorker: Worker;
};

const defaultValue: Context = {
  uploadWorker: null!,
};

export const WorkerContext = createContext<Context>(defaultValue);

export default function WorkerProvider({ children }: PropsWithChildren<{}>) {
  const uploadWorker = useMemo(() => new DownloadWorker(), []);

  return <WorkerContext.Provider value={{ uploadWorker }}>{children}</WorkerContext.Provider>;
}
