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

export function useFile(collectionFiles: string[], collectionName: string, imageName: string) {
  const { key, iv } = useContext(CryptoContext);
  const { cache, setCache } = useContext(CacheContext);

  const cacheKey = `${collectionName}:${imageName}`;
  const defaultValue = cache[cacheKey] ?? {
    encryptedFileBuffer: null,
    encryptedDescriptionBuffer: null,
    decryptedFileBuffer: null,
    decryptedDescriptionBuffer: null,
    url: null,
  };

  const [isFetching, setIsFetching] = useState(false);
  const [encryptedFileBuffer, setEncryptedFileBuffer] = useState<ArrayBuffer | null>(defaultValue.encryptedFileBuffer);
  const [encryptedDescriptionBuffer, setEncryptedDescriptionBuffer] = useState<ArrayBuffer | null>(defaultValue.encryptedDescriptionBuffer);

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedFileBuffer, setDecryptedFileBuffer] = useState<File | null>(defaultValue.decryptedFileBuffer);
  const [decryptedDescriptionBuffer, setDecryptedDescriptionBuffer] = useState<string | null>(defaultValue.decryptedDescriptionBuffer);

  const [url, setUrl] = useState<string | null>(defaultValue.url);

  const isReady = !isFetching && !isDecrypting && decryptedFileBuffer !== null;
  const isEncrypted = !isReady && decryptedFileBuffer === null;
  const hasDescription = decryptedDescriptionBuffer !== null;

  function refresh(collectionFiles: string[], collectionName: string, imageName: string) {
    setIsFetching(true);
    fetchAll(collectionFiles, collectionName, imageName)
      .then(({ file, description }) => {
        setEncryptedFileBuffer(file);
        setEncryptedDescriptionBuffer(description);

        setCache(cacheKey, {
          ...defaultValue,
          encryptedFileBuffer: file,
          encryptedDescriptionBuffer: description,
        });
      })
      .catch(() => {
        setEncryptedFileBuffer(null);
        setEncryptedDescriptionBuffer(null);

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
      console.log("Found in cache", cacheKey);
      const { encryptedFileBuffer, encryptedDescriptionBuffer, decryptedFileBuffer, decryptedDescriptionBuffer, url } = cache[cacheKey];

      if (encryptedFileBuffer === null) {
        console.log("Invalid in cache", cacheKey);
        refresh(collectionFiles, collectionName, imageName);
      } else {
        setEncryptedFileBuffer(encryptedFileBuffer);
        setEncryptedDescriptionBuffer(encryptedDescriptionBuffer);
        setDecryptedFileBuffer(decryptedFileBuffer);
        setDecryptedDescriptionBuffer(decryptedDescriptionBuffer);
        setUrl(url);
      }
    } else {
      console.log("Not found in cache", cacheKey);
      refresh(collectionFiles, collectionName, imageName);
    }
  }

  useEffect(() => {
    refreshWithCache(collectionFiles, collectionName, imageName);
  }, [collectionFiles, collectionName, imageName]);

  useEffect(() => {
    if (key !== null && iv !== null && encryptedFileBuffer !== null && decryptedFileBuffer === null) {
      setIsDecrypting(true);

      decrypt(key, encryptedFileBuffer, iv)
        .then(async (buffer) => {
          const name = await decryptString(key, iv, decodeBase64UrlToArrayBuffer(imageName));
          const type = safeMime(name) ?? "";
          const file = new File([buffer], name, { type });

          setDecryptedFileBuffer(file);

          const newUrl = URL.createObjectURL(file);
          setUrl(newUrl);

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
          setDecryptedFileBuffer(null);
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
          setDecryptedDescriptionBuffer(description);

          setCache(cacheKey, {
            ...defaultValue,
            decryptedDescriptionBuffer: description,
          });
        })
        .catch(() => {
          setDecryptedDescriptionBuffer(null);
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

export function useNewImage(collection: CollectionItem, imageName: string) {
  const file = useFile(collection.files, collection.name, imageName!);
  const [dimensions, setDimensions] = useState("");

  const indexInCollection = collection.files.indexOf(imageName);
  const visibleFiles = collection.files.filter((file) => !file.startsWith("."));
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
    previousImageUrl: indexInCollection === 0 ? null : `/collection/${collection.name}/image/${previous}`,
    nextImageUrl: indexInCollection === collection.files.length - 1 ? null : `/collection/${collection.name}/image/${next}`,
    shouldDisplayDimensions: file.file?.type.startsWith("image/") ?? false,
  };
}

export default function useImage(collectionName: string, imageName: string) {
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
