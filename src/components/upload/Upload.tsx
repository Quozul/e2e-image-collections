import { useContext, useEffect, useState } from "react";
import { CollectionItem } from "~/helpers/api";
import { CryptoContext } from "~/contexts/CryptoContext";
import "./upload.css";
import { classNames } from "~/helpers/classNames";
import useCollection from "~/components/collection/useCollection";
import { WorkerContext } from "~/contexts/WorkerContext";
import Password from "~/components/password/Password";
import { StatusMessage } from "~/workers/UploadWorker";
import { CacheContext } from "~/contexts/CacheContext";

type Props = {
  collection: CollectionItem;
};

export default function Upload({ collection }: Props) {
  const { key, iv } = useContext(CryptoContext);
  const { refresh } = useCollection(collection.name);
  const [files, setFiles] = useState<File[]>([]);
  const [total, setTotal] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isFileSystemApiSupported = "showDirectoryPicker" in window;
  const { uploadWorker } = useContext(WorkerContext);
  const { setCache } = useContext(CacheContext);

  function messageHandler({ data }: MessageEvent<StatusMessage>) {
    const { type } = data;
    switch (type) {
      case "ImageDownloaded": {
        const { collectionName, imageName, file } = data;
        const cacheKey = `${collectionName}/${imageName}`;
        setCache(cacheKey, file);
        break;
      }
      case "UploadDone": {
        refresh();
        break;
      }
    }
  }

  useEffect(() => {
    uploadWorker.addEventListener("message", messageHandler);

    return () => {
      uploadWorker.removeEventListener("message", messageHandler);
    };
  }, []);

  const classes = classNames({
    "grid cols-2 position-relative grow-1": isFileSystemApiSupported,
    "position-relative grow-1": !isFileSystemApiSupported,
  });

  if (key === null) {
    return (
      <div className="grow-1 flex-col">
        <Password className="grow-1 flex" />
        <span className="text-danger">A password is required to upload files.</span>
      </div>
    );
  }

  return (
    <div className={classes}>
      <label className="flex-col cursor-pointer">
        <input
          className="none"
          type="file"
          multiple
          disabled={files.length > 0}
          onChange={({ currentTarget }) => {
            uploadWorker.postMessage({ files: currentTarget.files, key, iv, collection: collection.name });
            currentTarget.value = "";
          }}
        />

        <div className="btn" aria-disabled={files.length > 0}>
          Upload files
        </div>

        {error !== null && <span className="text-danger">{error}</span>}
      </label>

      {isFileSystemApiSupported && (
        <label className="flex-col cursor-pointer">
          <button
            onClick={async () => {
              // @ts-ignore
              const dirHandle = await window.showDirectoryPicker();
              uploadWorker.postMessage({ files: dirHandle, key, iv, collection: collection.name });
            }}
            disabled={files.length > 0}
          >
            Upload directory
          </button>

          {error !== null && <span className="text-danger">{error}</span>}
        </label>
      )}

      {files.length > 0 && (
        <progress
          className="progress-bar position-absolute top-0 bottom-0 left-0 right-0 w-100 h-100 rounded-1"
          max={total}
          value={progress}
        >
          {(progress / total) * 100}%
        </progress>
      )}
    </div>
  );
}
