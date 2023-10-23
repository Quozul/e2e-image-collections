import { useContext } from "react";
import { WorkerContext } from "~/contexts/WorkerContext";

export default function WorkerTest() {
  const { uploadWorker } = useContext(WorkerContext);

  return (
    <button
      onClick={async () => {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        uploadWorker.postMessage(dirHandle);
      }}
    >
      Spawn worker
    </button>
  );
}
