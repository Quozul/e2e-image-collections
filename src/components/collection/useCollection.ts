import { useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import { CryptoContext } from "~/components/CryptoContext";
import { CollectionContext } from "~/components/CollectionContext";
import { getOrCreateCollection } from "~/helpers/api";
import { extractBytesFromString } from "~/helpers/encryption";

export default function useCollection(collectionName: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [pageSize, setPageSize] = useState(24);
  const [paginatedCollection, setPaginatedCollection] = useState<string[]>([]);
  const [decryptedCollectionFileNames, setDecryptedCollectionFileNames] = useState<string[]>([]);

  const { setIv } = useContext(CryptoContext);
  const { collection, setCollection } = useContext(CollectionContext);

  const currentPage = parseInt(searchParams.get("page") ?? "0");
  const totalPages = Math.ceil((collection?.files.length ?? 0) / pageSize) - 1;

  function refresh(collectionName: string) {
    getOrCreateCollection(collectionName).then((collectionItem) => {
      setCollection(collectionItem);
      setIv(extractBytesFromString(atob(collectionItem.iv)));
    });
  }

  useEffect(() => {
    if (collection?.name !== collectionName) {
      refresh(collectionName);
    }
  }, [collectionName, collection?.name]);

  useEffect(() => {
    const newContent =
      collection?.files.filter((name) => !name.startsWith(".")).slice(currentPage * pageSize, (currentPage + 1) * pageSize) ?? [];
    setPaginatedCollection(newContent);
  }, [collection?.files, currentPage, pageSize]);

  return {
    currentPage,
    totalPages,
    paginatedCollection,
    collection,
    closeCollection: () => {
      setCollection(null);
    },
    previousPage: () => {
      const params = new URLSearchParams({ page: (currentPage - 1).toString() });
      setSearchParams(params);
    },
    nextPage: () => {
      const params = new URLSearchParams({ page: (currentPage + 1).toString() });
      setSearchParams(params);
    },
    setPage: (page: number) => {
      const params = new URLSearchParams({ page: page.toString() });
      setSearchParams(params);
    },
    pageSize,
    setPageSize,
    refresh: () => refresh(collectionName),
  };
}
