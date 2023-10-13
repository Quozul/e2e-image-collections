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
    `${window.location.protocol}//${window.location.hostname}/api/collection/${collection}`,
    {
      mode: "cors",
      method: "post",
    },
  );

  return await response.json();
}

export async function uploadFile(
  collection: string,
  name: string,
  buffer: ArrayBuffer,
) {
  await fetch(
    `${window.location.protocol}//${window.location.hostname}/api/collection/${collection}/image/${name}`,
    {
      mode: "cors",
      method: "post",
      body: buffer,
    },
  );
}

export async function deleteFile(collection: string, name: string) {
  await fetch(
    `${window.location.protocol}//${window.location.hostname}/api/collection/${collection}/image/${name}`,
    {
      mode: "cors",
      method: "delete",
    },
  );
}
