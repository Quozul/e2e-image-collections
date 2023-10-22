import { useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { CryptoContext } from "~/components/CryptoContext";

export default function useCollection(collectionName: string) {
  const [pageSize, setPageSize] = useState(24);
  const [paginatedCollection, setPaginatedCollection] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { getCollection, collection, closeCollection } = useContext(CryptoContext);
  const currentPage = parseInt(searchParams.get("page") ?? "0");
  const totalPages = Math.ceil((collection?.files.length ?? 0) / pageSize) - 1;

  useEffect(() => {
    getCollection(String(collectionName));
  }, [collectionName]);

  useEffect(() => {
    const newContent =
      collection?.files.filter((name) => !name.startsWith(".")).slice(currentPage * pageSize, (currentPage + 1) * pageSize) ?? [];
    setPaginatedCollection(newContent);
  }, [collection, currentPage, pageSize]);

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
    setPage: (page: number) => {
      const params = new URLSearchParams({ page: page.toString() });
      setSearchParams(params);
    },
    pageSize,
    setPageSize,
  };
}
