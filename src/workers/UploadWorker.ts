import { decodeBase64UrlToArrayBuffer, decrypt, decryptString, encryptFile } from "~/helpers/encryption";
import { uploadFiles } from "~/helpers/api";
import safeMime from "~/helpers/safeMime";

function* chunked<T>(array: T[], chunkSize: number = 10) {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

async function processFiles(data: FileSystemDirectoryHandle | FileList, key: CryptoKey, iv: Uint8Array, collection: string) {
  const files: File[] = [];

  if (data instanceof FileSystemDirectoryHandle) {
    // @ts-ignore
    const values = data.values();

    for await (const handle of values) {
      if (handle instanceof FileSystemFileHandle) {
        files.push(await handle.getFile());
      }
    }
  } else if (data instanceof FileList) {
    for (const file of data) {
      files.push(file);
    }
  }

  const totalSize = files.map(({ size }) => size).reduce((acc, cur) => acc + cur);
  let loadedSize = 0;

  for (const file of files) {
    const encryptedFile = await encryptFile(key, iv, file);
    await uploadFiles(collection, [encryptedFile]);

    loadedSize += file.size;

    const message: UploadProgress = {
      type: "UploadProgress",
      loadedSize,
      totalSize,
    };

    postMessage(message);
  }

  const message: UploadDone = {
    type: "UploadDone",
  };

  postMessage(message);
}

type UploadDone = {
  type: "UploadDone";
};

type UploadProgress = {
  type: "UploadProgress";
  loadedSize: number;
  totalSize: number;
};

type ImageDownloaded = {
  type: "ImageDownloaded";
  collectionName: string;
  imageName: string;
  file: Image;
};

export type StatusMessage = UploadDone | UploadProgress | ImageDownloaded;

export type Message = {
  files: FileSystemDirectoryHandle | FileList | { collectionName: string; imageName: string };
  key: CryptoKey;
  iv: Uint8Array;
  collection: string;
};

export type Image = {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

const cache: Record<string, Image> = {};

async function fetchFile(collectionName: string, imageName: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/collection/${collectionName}/image/${imageName}`);
  return await response.arrayBuffer();
}

async function decryptFile(key: CryptoKey, encryptedFileBuffer: ArrayBuffer, iv: Uint8Array, encryptedFileName: string) {
  const buffer = await decrypt(key, encryptedFileBuffer, iv);
  const decryptedFileName = await decryptString(key, iv, decodeBase64UrlToArrayBuffer(encryptedFileName));
  const type = safeMime(decryptedFileName) ?? "";
  return new File([buffer], decryptedFileName, { type });
}

addEventListener("message", async ({ data }: MessageEvent<Message>) => {
  const { files, key, iv, collection } = data;

  if (files instanceof FileList || files instanceof FileSystemDirectoryHandle) {
    await processFiles(files, key, iv, collection);
  } else {
    const { collectionName, imageName } = files;
    const cacheKey = `${collectionName}/${imageName}`;

    if (!(cacheKey in cache)) {
      // TODO: Catch errors
      const encryptedFile = await fetchFile(collectionName, imageName);
      const file = await decryptFile(key, encryptedFile, iv, imageName);

      cache[cacheKey] = {
        url: URL.createObjectURL(file),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };
    }

    const message: StatusMessage = {
      type: "ImageDownloaded",
      collectionName,
      imageName,
      file: cache[cacheKey],
    };

    postMessage(message);
  }
});
