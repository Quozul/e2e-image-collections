import { useNavigate, useParams } from "react-router-dom";
import EncryptedImage from "../EncryptedImage.tsx";
import { useContext, useEffect, useState } from "react";
import { CryptoContext } from "../CryptoContext.tsx";
import Upload from "../upload/Upload.tsx";

export default function Collection() {
  const navigate = useNavigate();
  const { collection: collectionName } = useParams();
  const { key, getCollection, collection, closeCollection } =
    useContext(CryptoContext);
  const [visibleModal, setVisibleModal] = useState<string | null>(null);

  useEffect(() => {
    getCollection(collectionName);
  }, [collectionName]);

  return (
    <div className="column p-20">
      <div className="row w-100">
        <h1>{collection?.name ?? collectionName}</h1>

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
            <div className="container">
              {collection.files.map((name) => (
                <EncryptedImage
                  key={name}
                  collectionName={collection.name}
                  imageName={name}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
