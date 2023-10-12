type CollectionItem = {
  name: string;
};

export async function getCollectionContent(
  collection: string,
): Promise<CollectionItem[]> {
  if (collection.length === 0) {
    return [];
  }

  try {
    const response = await fetch(
      `${window.location.protocol}//${window.location.hostname}:8000/api/collection/${collection}`,
      {
        mode: "cors",
      },
    );

    return await response.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function createCollection(
  collection: string,
): Promise<CollectionItem[]> {
  if (collection.length === 0) {
    return [];
  }

  try {
    const response = await fetch(
      `${window.location.protocol}//${window.location.hostname}:8000/api/collection/${collection}`,
      {
        mode: "cors",
        method: "post",
      },
    );

    return await response.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function uploadFile(collection: string, name: string, blob: Blob) {
  await fetch(
    `${window.location.protocol}//${window.location.hostname}:8000/api/collection/${collection}/image/${name}`,
    {
      mode: "cors",
      method: "post",
      headers: {
        "content-type": blob.type,
      },
      body: await blob.arrayBuffer(),
    },
  );
}

export async function deleteFile(collection: string, name: string) {
  await fetch(
    `${window.location.protocol}//${window.location.hostname}:8000/api/collection/${collection}/image/${name}`,
    {
      mode: "cors",
      method: "delete",
    },
  );
}
