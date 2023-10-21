import { useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { CryptoContext } from "~/components/CryptoContext";

const PAGE_SIZE = 24;

export default function useCollection(collectionName: string) {
  const [paginatedCollection, setPaginatedCollection] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { getCollection, collection, closeCollection } = useContext(CryptoContext);
  const currentPage = parseInt(searchParams.get("page") ?? "0");
  const totalPages = Math.ceil((collection?.files.length ?? 0) / PAGE_SIZE) - 1;

  useEffect(() => {
    getCollection(String(collectionName));
  }, [collectionName]);

  useEffect(() => {
    const newContent = collection?.files.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE) ?? [];
    console.log("refresh paginated content", paginatedCollection.length, newContent.length, collection?.files.length);
    setPaginatedCollection(newContent);
  }, [collection, currentPage]);

  return {
    currentPage,
    totalPages,
    paginatedCollection,
    collection,
    closeCollection,
    previousPage: () => {
      const params = new URLSearchParams({ page: (currentPage - 1).toString() });
      setSearchParams(params);
    },
    nextPage: () => {
      const params = new URLSearchParams({ page: (currentPage + 1).toString() });
      setSearchParams(params);
    },
  };
}
