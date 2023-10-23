import { encryptFile } from "~/helpers/encryption";
import { uploadFiles } from "~/helpers/api";

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

  for (const chunk of chunked(files, 100)) {
    const encryptedFiles: File[] = [];

    for (const file of chunk) {
      await encryptFile(key, iv, file);
    }

    await uploadFiles(collection, encryptedFiles);
  }

  postMessage("done");
}

type Message = {
  files: FileSystemDirectoryHandle | FileList;
  key: CryptoKey;
  iv: Uint8Array;
  collection: string;
};

addEventListener("message", async ({ data }: MessageEvent<Message>) => {
  const { files, key, iv, collection } = data;

  if (files instanceof FileList || files instanceof FileSystemDirectoryHandle) {
    await processFiles(files, key, iv, collection);
  }
});
