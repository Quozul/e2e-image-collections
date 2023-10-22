import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { CryptoContext, ImageInformation } from "~/components/CryptoContext";
import { decodeBase64UrlToArrayBuffer, decrypt, decryptString, encryptString, extractBytesFromString } from "~/helpers/encryption";
import { CollectionItem, uploadFile } from "~/helpers/api";
import safeMime from "~/helpers/safeMime";
import { CacheContext } from "~/components/CacheContext";

async function fetchFile(collectionName: string, imageName: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/collection/${collectionName}/image/${imageName}`);
  return await response.arrayBuffer();
}

async function fetchDescription(collectionFiles: string[], collectionName: string, imageName: string) {
  const descriptionFileName = `.${imageName}`;

  if (!collectionFiles.includes(descriptionFileName)) {
    return null;
  }

  return await fetchFile(collectionName, descriptionFileName);
}

async function fetchAll(
  collectionFiles: string[],
  collectionName: string,
  imageName: string,
): Promise<{
  file: ArrayBuffer | null;
  description: ArrayBuffer | null;
}> {
  const [file, description] = await Promise.all([
    fetchFile(collectionName, imageName),
    fetchDescription(collectionFiles, collectionName, imageName),
  ]);

  return { file, description };
}

export type UseFile = {
  file: File | null;
  isReady: boolean;
  isEncrypted: boolean;
  description: string | null;
  isFetching: boolean;
  hasDescription: boolean;
  refresh: () => void;
  url: string | null;
  isDecrypting: boolean;
};

export function useFile(collectionFiles: string[], collectionName: string, imageName: string, load = true): UseFile {
  const { key, iv } = useContext(CryptoContext);
  const { cache, setCache } = useContext(CacheContext);

  const [isLoaded, setIsLoaded] = useState(false);

  const cacheKey = `${collectionName}:${imageName}`;
  const defaultValue =
    cacheKey in cache && isLoaded
      ? cache[cacheKey]
      : {
          encryptedFileBuffer: null,
          encryptedDescriptionBuffer: null,
          decryptedFileBuffer: null,
          decryptedDescriptionBuffer: null,
          url: null,
        };

  const { encryptedFileBuffer, encryptedDescriptionBuffer, decryptedFileBuffer, decryptedDescriptionBuffer, url } = defaultValue;

  const [isFetching, setIsFetching] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const isReady = !isFetching && !isDecrypting && decryptedFileBuffer !== null;
  const isEncrypted = !isReady && decryptedFileBuffer === null;
  const hasDescription = decryptedDescriptionBuffer !== null;

  function refresh(collectionFiles: string[], collectionName: string, imageName: string) {
    setIsFetching(true);
    fetchAll(collectionFiles, collectionName, imageName)
      .then(({ file, description }) => {
        setCache(cacheKey, {
          ...defaultValue,
          encryptedFileBuffer: file,
          encryptedDescriptionBuffer: description,
        });
      })
      .catch(() => {
        setCache(cacheKey, {
          ...defaultValue,
          encryptedFileBuffer: null,
          encryptedDescriptionBuffer: null,
        });
      })
      .finally(() => {
        setIsFetching(false);
      });
  }

  function refreshWithCache(collectionFiles: string[], collectionName: string, imageName: string) {
    const cacheKey = `${collectionName}:${imageName}`;

    if (cacheKey in cache) {
      const { encryptedFileBuffer } = cache[cacheKey];

      if (encryptedFileBuffer === null) {
        refresh(collectionFiles, collectionName, imageName);
      }
    } else {
      refresh(collectionFiles, collectionName, imageName);
    }
  }

  useEffect(() => {
    if (load && !isLoaded) {
      refreshWithCache(collectionFiles, collectionName, imageName);
      setIsLoaded(true);
    }
  }, [collectionFiles, collectionName, imageName, load]);

  useEffect(() => {
    if (key !== null && iv !== null && encryptedFileBuffer !== null && decryptedFileBuffer === null) {
      setIsDecrypting(true);

      decrypt(key, encryptedFileBuffer, iv)
        .then(async (buffer) => {
          const name = await decryptString(key, iv, decodeBase64UrlToArrayBuffer(imageName));
          const type = safeMime(name) ?? "";
          const file = new File([buffer], name, { type });

          const newUrl = URL.createObjectURL(file);

          setCache(cacheKey, {
            ...defaultValue,
            url: newUrl,
            decryptedFileBuffer: file,
          });

          // Revoke previous Object url if any
          if (url !== null) {
            URL.revokeObjectURL(url);
          }
        })
        .catch(() => {
          setCache(cacheKey, {
            ...defaultValue,
            url: null,
            decryptedFileBuffer: null,
          });

          if (url !== null) {
            URL.revokeObjectURL(url);
          }
        })
        .finally(() => {
          setIsDecrypting(false);
        });
    }
  }, [key, iv, encryptedFileBuffer]);

  useEffect(() => {
    if (key !== null && iv !== null && encryptedDescriptionBuffer !== null && decryptedDescriptionBuffer === null) {
      decryptString(key, iv, encryptedDescriptionBuffer)
        .then((description) => {
          setCache(cacheKey, {
            ...defaultValue,
            decryptedDescriptionBuffer: description,
          });
        })
        .catch(() => {
          setCache(cacheKey, {
            ...defaultValue,
            url: null,
            decryptedDescriptionBuffer: null,
          });
        });
    }
  }, [key, iv, encryptedDescriptionBuffer]);

  return {
    file: decryptedFileBuffer,
    description: decryptedDescriptionBuffer,
    isFetching,
    isDecrypting,
    isReady,
    isEncrypted,
    hasDescription,
    refresh: () => refresh(collectionFiles, collectionName, imageName),
    url,
  };
}

export default function useImage(collection: CollectionItem, imageName: string, load = true) {
  const file = useFile(collection.files, collection.name, imageName!, load);
  const [dimensions, setDimensions] = useState("");

  const visibleFiles = collection.files.filter((file) => !file.startsWith("."));
  const indexInCollection = visibleFiles.indexOf(imageName);
  const previous = indexInCollection >= 0 ? visibleFiles[indexInCollection - 1] ?? null : null;
  const next = indexInCollection >= 0 ? visibleFiles[indexInCollection + 1] ?? null : null;

  return {
    file,
    onImageLoad: ({ currentTarget }: SyntheticEvent<HTMLImageElement>) => {
      setDimensions(`${currentTarget.naturalWidth ?? 0} × ${currentTarget.naturalHeight ?? 0}`);
    },
    formattedFileSize:
      file.file?.size.toLocaleString(undefined, {
        style: "unit",
        unit: "byte",
        unitDisplay: "narrow",
        notation: "compact",
      }) ?? "N/A",
    dimensions,
    fileName: file.file?.name ?? imageName,
    indexInCollection,
    previousImageUrl: indexInCollection <= 0 ? null : `/collection/${collection.name}/image/${previous}`,
    nextImageUrl: indexInCollection >= visibleFiles.length - 1 ? null : `/collection/${collection.name}/image/${next}`,
    shouldDisplayDimensions: file.file?.type.startsWith("image/") ?? false,
  };
}

function useDescription(collectionName: string, imageName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { key, collection, getImage } = useContext(CryptoContext);
  const [image, setImage] = useState<ImageInformation | null>(null);
  const [newDescription, setNewDescription] = useState<string>("");
  const [dimensions, setDimensions] = useState("");
  const { file, description, refresh, url } = useFile(collection!.files, collectionName, imageName);

  useEffect(() => {
    setNewDescription(description ?? "");
  }, [description]);

  return {
    url,
    image:
      image === null
        ? null
        : {
            ...image,
            size:
              image?.size.toLocaleString(undefined, {
                style: "unit",
                unit: "byte",
                unitDisplay: "narrow",
                notation: "compact",
              }) ?? "N/A",
          },
    onImageLoad: ({ currentTarget }: SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      setDimensions(`${currentTarget.naturalWidth ?? 0} × ${currentTarget.naturalHeight ?? 0}`);
    },
    dimensions,
    isNewDescription: image?.description !== newDescription,
    updateDescription: async () => {
      if (image === null || collection === null || key === null) return;

      if (image.description !== newDescription) {
        const file = await encryptString(key, extractBytesFromString(atob(collection.iv)), newDescription, `.${imageName}`);

        await uploadFile(String(collectionName), [file]);

        refresh();
      }
    },
    setNewDescription,
    isLoading,
    newDescription,
    previousImageUrl: image === null ? "#" : `/collection/${collectionName}/image/${image.previous}`,
    nextImageUrl: image === null ? "#" : `/collection/${collectionName}/image/${image.next}`,
  };
}
