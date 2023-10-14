import fetchProgress from "../../helpers/fetchProgress";

export type CollectionItem = {
  iv: string;
  name: string;
  files: string[];
};

export async function getOrCreateCollection(
  collection: string,
): Promise<CollectionItem> {
  if (collection.length === 0) {
    throw Error("Collection name must not be empty.");
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/collection/${collection}`,
    {
      mode: "cors",
      method: "post",
    },
  );

  return await response.json();
}

export async function uploadFile(collection: string, file: File) {
  return fetchProgress(
    `${import.meta.env.VITE_API_URL}/collection/${collection}/image/${
      file.name
    }`,
    "post",
    await file.arrayBuffer(),
  );
}

export async function deleteFile(collection: string, name: string) {
  await fetch(
    `${import.meta.env.VITE_API_URL}/collection/${collection}/image/${name}`,
    {
      mode: "cors",
      method: "delete",
    },
  );
}
