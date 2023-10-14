import { useContext, useEffect, useState } from "react";

import { encryptFile, extractBytesFromString } from "~/helpers/encryption";
import { CollectionItem, uploadFile } from "~/components/collection/collection";
import { CryptoContext } from "~/components/CryptoContext";
import "./progress.css";

type Props = {
  collection: CollectionItem;
};

type Progress = {
  name: string;
  status: string;
  progress: number;
  total: number;
};

export default function Upload({ collection }: Props) {
  const { key, getCollection } = useContext(CryptoContext);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Progress[]>([]);
  const [total, setTotal] = useState(0);

  const progress = uploadedFiles
    .map(({ progress }) => progress)
    .reduce((previousValue, currentValue) => previousValue + currentValue, 0);

  async function uploadFiles() {
    if (key === null) return;

    try {
      const total = files
        .map((file) => file.size)
        .reduce(
          (previousValue, currentValue) => previousValue + currentValue,
          0,
        );
      setTotal(total);

      const iv = extractBytesFromString(collection.iv);
      const uploadedFiles: Progress[] = [];

      for (const file of files) {
        const encryptedFile = await encryptFile(key, iv, file);

        const upload = await uploadFile(collection.name, encryptedFile);
        let uploadingFile: Progress = {
          name: file.name,
          status: "progress",
          progress: 0,
          total: file.size,
        };

        for await (const event of upload) {
          uploadingFile = {
            name: file.name,
            status: event.type,
            progress: event.loaded,
            total: event.total,
          };
          setUploadedFiles([...uploadedFiles, uploadingFile]);
        }

        uploadedFiles.push(uploadingFile);
        setUploadedFiles(uploadedFiles);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (files.length > 0) {
      setUploadedFiles([]);
      uploadFiles().then(() => {
        setFiles([]);
        getCollection(collection.name, true);
      });
    }
  }, [files]);

  return (
    <div className="progress-container">
      <label className="progress-label">
        <input
          className="upload-input"
          type="file"
          multiple
          disabled={files.length > 0}
          onChange={({ currentTarget }) => {
            setFiles(Array.from(currentTarget.files ?? []));
          }}
        />

        {files.length > 0 && (
          <progress className="progress-bar" max={total} value={progress}>
            {(progress / total) * 100}%
          </progress>
        )}
      </label>

      <div className="upload-list">
        {files.map((file) => {
          const element = uploadedFiles.find(({ name }) => file.name === name);
          const status = element?.status ?? null;
          const progress = element?.progress ?? 0;
          const total = element?.total ?? 0;

          return (
            <div className="file-row" key={file.name}>
              <div className="inner">
                {file.name}

                {status === "load" ? (
                  <i className="bi bi-check" />
                ) : status === "error" ? (
                  <i className="bi bi-x" />
                ) : (
                  <i className="bi bi-hourglass-split" />
                )}
              </div>

              <progress className="progress-bar" max={total} value={progress}>
                {(progress / total) * 100}%
              </progress>
            </div>
          );
        })}
      </div>
    </div>
  );
}
