import { useContext, useEffect, useState } from "react";

import { encryptFile, extractBytesFromString } from "~/helpers/encryption";
import { CollectionItem, uploadFileWithProgress } from "~/helpers/api";
import { CryptoContext } from "~/components/CryptoContext";
import "./upload.css";

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

  const progress = uploadedFiles.map(({ progress }) => progress).reduce((previousValue, currentValue) => previousValue + currentValue, 0);

  async function uploadFiles() {
    if (key === null) return;

    try {
      const total = files.map((file) => file.size).reduce((previousValue, currentValue) => previousValue + currentValue, 0);
      setTotal(total);

      const iv = extractBytesFromString(collection.iv);
      const uploadedFiles: Progress[] = [];

      for (const file of files) {
        const encryptedFile = await encryptFile(key, iv, file);

        const upload = await uploadFileWithProgress(collection.name, encryptedFile);
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
    <label className="flex-col position-relative">
      <input
        className="cursor-pointer"
        type="file"
        multiple
        disabled={files.length > 0}
        onChange={({ currentTarget }) => {
          setFiles(Array.from(currentTarget.files ?? []));
          currentTarget.value = "";
        }}
      />

      {files.length > 0 && (
        <progress
          className="progress-bar position-absolute top-0 bottom-0 left-0 right-0 w-100 h-100 rounded-1"
          max={total}
          value={progress}
        >
          {(progress / total) * 100}%
        </progress>
      )}
    </label>
  );
}
