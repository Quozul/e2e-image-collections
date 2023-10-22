import fetchProgress from "./fetchProgress";

export type CollectionItem = {
  iv: string;
  name: string;
  files: string[];
};

export async function getOrCreateCollection(collection: string): Promise<CollectionItem> {
  if (collection.length === 0) {
    throw Error("Collection name must not be empty.");
  }

  const url = `${import.meta.env.VITE_API_URL}/collection/${collection}?show_hidden_files=true`;

  const response = await fetch(url, {
    mode: "cors",
    method: "get",
  });

  return await response.json();
}

export async function uploadFileWithProgress(collection: string, files: File[]) {
  const url = `${import.meta.env.VITE_API_URL}/collection/${collection}`;

  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file, file.name);
  }

  return fetchProgress(url, {
    method: "post",
    body: formData,
  });
}

export async function uploadFile(collection: string, files: File[]) {
  const url = `${import.meta.env.VITE_API_URL}/collection/${collection}`;

  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file, file.name);
  }

  return fetch(url, { body: formData, method: "post" });
}

export async function deleteFile(collection: string, name: string) {
  const url = `${import.meta.env.VITE_API_URL}/collection/${collection}/image/${name}`;

  await fetch(url, {
    mode: "cors",
    method: "delete",
  });
}
