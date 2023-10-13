import {
  bytesToBase64Url,
  encrypt,
  extractBytesFromString,
} from "./encryption.ts";
import { CollectionItem, uploadFile } from "./collection.ts";
import { CryptoContext } from "./CryptoContext.tsx";
import { useContext, useEffect, useState } from "react";
import "./progress.css";

type Props = {
  collection: CollectionItem;
};

export default function Upload({ collection }: Props) {
  const { key, getCollection } = useContext(CryptoContext);
  const [files, setFiles] = useState<File[] | null>(null);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  async function uploadFiles() {
    try {
      setTotal(files.length);
      const iv = extractBytesFromString(collection.iv);

      let index = 0;

      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const encryptedName = encodeURIComponent(
          await bytesToBase64Url(
            await encrypt(key, extractBytesFromString(file.name).buffer, iv),
          ),
        );
        const encryptedContent = await encrypt(key, buffer, iv);

        await uploadFile(collection.name, encryptedName, encryptedContent);
        setProgress(++index);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (files !== null) {
      uploadFiles().then(() => {
        setFiles(null);
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
          onChange={({ currentTarget }) => {
            setFiles(Array.from(currentTarget.files));
          }}
        />

        <button className="upload-button">Upload file</button>
      </label>

      {files !== null && (
        <>
          <progress className="progress-bar" max={total} value={progress}>
            {(progress / total) * 100}%
          </progress>
          <div>
            {files.map((file) => {
              return <div className="file-row">{file.name}</div>;
            })}
          </div>
        </>
      )}
    </div>
  );
}
