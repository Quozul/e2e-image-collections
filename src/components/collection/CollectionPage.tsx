import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import EncryptedImage from "~/components/EncryptedImage";
import { CryptoContext } from "~/components/CryptoContext";
import Upload from "~/components/upload/Upload";

const PAGE_SIZE = 50;

export default function CollectionPage() {
  const navigate = useNavigate();
  const { collection: collectionName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getCollection, collection, closeCollection } = useContext(CryptoContext);
  const page = parseInt(searchParams.get("page") ?? "0");
  const totalPages = Math.ceil((collection?.files.length ?? 0) / PAGE_SIZE) - 1;
  const [cover, setCover] = useState(true);

  useEffect(() => {
    getCollection(String(collectionName));
  }, [collectionName]);

  return (
    <div className="flex-col p-2">
      <div className="flex w-100 justify-space-between">
        <h1>
          {collection?.name ?? collectionName}({collection?.files.length ?? 0} files)
        </h1>

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
          <div className="flex">
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
            "The collection is empty"
          ) : (
            <>
              <div className="grid cols-1 sm:cols-2 md:cols-3 lg:cols-4 xl:cols-5 xxl:cols-6 grow-1">
                {collection.files.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((name) => (
                  <EncryptedImage cover={cover} key={name} collectionName={collection.name} imageName={name} />
                ))}
              </div>

              <div className="flex align-center justify-center">
                <button
                  onClick={() => {
                    const params = new URLSearchParams({ page: (page - 1).toString() });
                    setSearchParams(params);
                  }}
                  disabled={page === 0}
                >
                  Previous page
                </button>

                <span>
                  Page {page + 1} / {totalPages + 1}
                </span>

                <button
                  onClick={() => {
                    const params = new URLSearchParams({ page: (page + 1).toString() });
                    setSearchParams(params);
                  }}
                  disabled={page >= totalPages}
                >
                  Next page
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
