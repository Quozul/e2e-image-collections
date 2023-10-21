import { useContext, useEffect } from "react";
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

  useEffect(() => {
    getCollection(String(collectionName));
  }, [collectionName]);

  return (
    <div className="column p-20">
      <div className="row w-100">
        <h1>
          {collection?.name ?? collectionName}({collection?.files.length ?? 0} files)
        </h1>

        <button
          onClick={() => {
            closeCollection();
            navigate("/");
          }}
        >
          Close collection
        </button>
      </div>

      {collection === null ? (
        "Collection is not defined"
      ) : (
        <>
          <Upload collection={collection} />

          {collection.files.length === 0 ? (
            "The collection is empty"
          ) : (
            <>
              <div className="container">
                {collection.files.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((name) => (
                  <EncryptedImage key={name} collectionName={collection.name} imageName={name} />
                ))}
              </div>

              <div className="flex">
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
