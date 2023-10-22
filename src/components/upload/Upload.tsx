import { useContext, useEffect, useState } from "react";

import { encryptFile, extractBytesFromString } from "~/helpers/encryption";
import { CollectionItem, uploadFileWithProgress } from "~/helpers/api";
import { CryptoContext } from "~/components/CryptoContext";
import "./upload.css";
import { classNames } from "~/helpers/classNames";
import useCollection from "~/components/collection/useCollection";

type Props = {
  collection: CollectionItem;
};

export default function Upload({ collection }: Props) {
  const { key } = useContext(CryptoContext);
  const { refresh } = useCollection(collection.name);
  const [files, setFiles] = useState<File[]>([]);
  const [total, setTotal] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isFileSystemApiSupported = "showDirectoryPicker" in window;

  async function uploadFiles() {
    if (key === null) return;

    setError(null);

    try {
      const total = files.map((file) => file.size).reduce((previousValue, currentValue) => previousValue + currentValue, 0);
      setTotal(total);
      setProgress(0);

      const iv = extractBytesFromString(atob(collection.iv));

      const encryptedFiles = await Promise.all(files.map(async (file) => await encryptFile(key, iv, file)));

      const upload = await uploadFileWithProgress(collection.name, encryptedFiles);

      for await (const event of upload) {
        setProgress(event.loaded);
      }
    } catch (e) {
      console.error(e);

      if (e instanceof ProgressEvent) {
        setError("Upload failed. Please check network connectivity.");
      } else if (e instanceof DOMException) {
        setError("Upload failed. You likely selected too much files or the files are too large to upload.");
      } else {
        setError(String(e));
      }
    }
  }

  useEffect(() => {
    if (files.length > 0) {
      uploadFiles().then(() => {
        setFiles([]);
        if (!isUploading) {
          refresh();
        }
      });
    }
  }, [files]);

  const classes = classNames({
    "grid cols-2 position-relative grow-1": isFileSystemApiSupported,
    "position-relative grow-1": !isFileSystemApiSupported,
  });

  return (
    <div className={classes}>
      <label className="flex-col cursor-pointer">
        <input
          className="none"
          type="file"
          multiple
          disabled={files.length > 0 || key === null}
          onChange={({ currentTarget }) => {
            setFiles(Array.from(currentTarget.files ?? []));
            currentTarget.value = "";
          }}
        />

        <div className="btn" aria-disabled={files.length > 0 || key === null}>
          Upload files
        </div>

        {error !== null && <span className="text-danger">{error}</span>}
      </label>

      {isFileSystemApiSupported && (
        <label className="flex-col cursor-pointer">
          <button
            onClick={async () => {
              const dirHandle = await window.showDirectoryPicker();
              const entries = dirHandle.entries();

              let prepareUpload = [];
              setIsUploading(true);

              for await (const [, handle] of entries) {
                prepareUpload.push(await handle.getFile());

                if (prepareUpload.length >= 24) {
                  setFiles(prepareUpload);
                  prepareUpload = [];
                }
              }

              setIsUploading(false);
              refresh();
            }}
            disabled={files.length > 0 || key === null}
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
