import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import EncryptedImage from "~/components/EncryptedImage";
import { CryptoContext } from "~/components/CryptoContext";
import Upload from "~/components/upload/Upload";

const PAGE_SIZE = 50;

export default function Collection() {
  const navigate = useNavigate();
  const { collection: collectionName } = useParams();
  const { getCollection, collection, closeCollection } =
    useContext(CryptoContext);
  const [page, setPage] = useState(0);

  useEffect(() => {
    getCollection(String(collectionName));
  }, [collectionName]);

  return (
    <div className="column p-20">
      <div className="row w-100">
        <h1>
          {collection?.name ?? collectionName}({collection?.files.length ?? 0}{" "}
          files)
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
                {collection.files
                  .slice(0, (page + 1) * PAGE_SIZE)
                  .map((name) => (
                    <EncryptedImage
                      key={name}
                      collectionName={collection.name}
                      imageName={name}
                    />
                  ))}
              </div>

              <button
                onClick={() => {
                  setPage((prevState) => prevState + 1);
                }}
              >
                Load more
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
