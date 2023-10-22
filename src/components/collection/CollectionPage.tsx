import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import EncryptedImage from "~/components/EncryptedImage";
import Upload from "~/components/upload/Upload";
import useCollection from "~/components/collection/useCollection";

export default function CollectionPage() {
  const navigate = useNavigate();
  const { collection: collectionName } = useParams();
  const [cover, setCover] = useState(true);

  const {
    paginatedCollection,
    currentPage: page,
    totalPages,
    previousPage,
    collection,
    closeCollection,
    nextPage,
    setPage,
    pageSize,
    setPageSize,
  } = useCollection(String(collectionName));

  return (
    <div className="flex-col p-2">
      <div className="flex wrap-1 w-100 justify-space-between">
        <h1>Collection: {collection?.name ?? collectionName}</h1>

        <button
          onClick={() => {
            closeCollection();
            navigate("/");
          }}
          className="danger"
        >
          Close collection
        </button>
      </div>

      {collection === null ? (
        "Collection is not defined"
      ) : (
        <>
          <div className="flex-col sm:flex-row">
            <Upload collection={collection} />

            <label className="flex align-center cursor-pointer user-select-none">
              Full image in preview
              <input
                type="checkbox"
                checked={!cover}
                onChange={({ currentTarget }) => {
                  setCover(!currentTarget.checked);
                }}
              />
            </label>
          </div>

          {collection.files.length === 0 ? (
            <div className="flex p-2 bg-background-muted justify-center">The collection is empty.</div>
          ) : (
            <>
              {paginatedCollection.length > 0 ? (
                <div className="grid cols-1 sm:cols-2 md:cols-3 lg:cols-4 xxl:cols-6 grow-1">
                  {paginatedCollection.map((name) => (
                    <EncryptedImage cover={cover} key={name} collection={collection} imageName={name} />
                  ))}
                </div>
              ) : (
                <div className="flex p-2 bg-background-muted justify-center">This page is empty.</div>
              )}

              <div className="flex align-center justify-center">
                <label className="none lg:flex align-center">
                  Elements per page:
                  <select
                    value={pageSize}
                    onChange={({ currentTarget }) => {
                      setPageSize(parseInt(currentTarget.value));
                    }}
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                    <option value={96}>96</option>
                  </select>
                </label>

                <button
                  className="none lg:block"
                  onClick={() => {
                    setPage(0);
                  }}
                  disabled={page <= 0}
                >
                  <i className="bi bi-chevron-double-left" />
                </button>

                <button onClick={previousPage} disabled={page <= 0}>
                  Previous
                </button>

                <div className="flex align-center">
                  Page:
                  <input
                    onInput={({ currentTarget }) => {
                      setPage(currentTarget.valueAsNumber);
                    }}
                    value={page}
                    type="number"
                    max={totalPages}
                    min={0}
                  />
                  of {totalPages}
                </div>

                <button onClick={nextPage} disabled={page >= totalPages}>
                  Next
                </button>

                <button
                  className="none lg:block"
                  onClick={() => {
                    setPage(totalPages);
                  }}
                  disabled={page >= totalPages}
                >
                  <i className="bi bi-chevron-double-right" />
                </button>

                <span className="none lg:block">{collection.files.length} total elements</span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
