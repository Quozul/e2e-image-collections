import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { CryptoContext, ImageInformation } from "~/components/CryptoContext";
import Password from "~/components/password/Password";
import { uploadFile } from "~/components/collection/collection";
import { encrypt, extractBytesFromString } from "~/helpers/encryption";
import "./image.css";

export default function Image() {
  const navigate = useNavigate();
  const { collection: collectionName, image: imageName } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const { key, collection, getImage } = useContext(CryptoContext);
  const [image, setImage] = useState<ImageInformation | null>(null);
  const [newDescription, setNewDescription] = useState<string>("");

  async function refresh(refresh = false) {
    getImage(String(collectionName), imageName, refresh)
      .then(setImage)
      .catch(() => {
        setImage(null);
      });
  }

  useEffect(() => {
    refresh();
  }, [collectionName, imageName, key]);

  useEffect(() => {
    setNewDescription(image?.description ?? "");
  }, [image]);

  return (
    <div className="image-page">
      <div className="row w-100">
        <h1 className="title">{image?.name ?? imageName}</h1>

        <button
          onClick={() => {
            navigate(`/collection/${collectionName}`);
          }}
        >
          Back to collection
        </button>
      </div>

      <div className="image-row">
        {image === null ? (
          <div className="image image-status p-20">
            <h1>
              <i className="bi bi-shield-lock"></i>
            </h1>
            File is encrypted
            <Password placeholder="Enter password to decrypt" />
          </div>
        ) : (
          isLoading && (
            <div className="image image-status p-20">
              <h1>
                <i className="bi bi-hourglass"></i>
              </h1>
              Image is loading
            </div>
          )
        )}

        {image !== null && (
          <>
            <img
              className="image"
              src={image.url}
              alt={image.name}
              onLoad={() => {
                setIsLoading(false);
              }}
            />

            <div>
              <div className="file-row">
                <span>Name</span>
                <span>{image.name}</span>
              </div>

              <div className="file-row">
                <span>Size</span>
                <span>
                  {image.size.toLocaleString("en-GB", {
                    style: "unit",
                    unit: "byte",
                    unitDisplay: "narrow",
                    notation: "compact",
                  })}
                </span>
              </div>

              <div className="file-row">
                <span>Type</span>
                <span>{image.type || "unknown"}</span>
              </div>

              <div className="file-row">
                <span>Index</span>
                <span>{image.index}</span>
              </div>

              <div className="file-row">
                <span className="row">
                  Description
                  {image.description !== newDescription && (
                    <i className="bi bi-pencil" />
                  )}
                </span>

                <textarea
                  onInput={({ currentTarget }) => {
                    currentTarget.style.height = "";
                    currentTarget.style.height =
                      currentTarget.scrollHeight - 16 + "px";
                    setNewDescription(currentTarget.value);
                  }}
                  onBlur={async () => {
                    if (image.description !== newDescription) {
                      console.log("update");
                      const encryptedContent = await encrypt(
                        key,
                        extractBytesFromString(newDescription),
                        extractBytesFromString(collection.iv),
                      );

                      const file = new File(
                        [encryptedContent],
                        `.${imageName}`,
                      );

                      for await (const event of await uploadFile(
                        String(collectionName),
                        file,
                      )) {
                        console.log(event);
                      }
                      await refresh(true);
                    }
                  }}
                  value={newDescription}
                  placeholder="Enter a description for this file."
                />
              </div>

              <div className="file-row actions">
                <button
                  onClick={() => {
                    navigate(
                      `/collection/${collectionName}/image/${image.previous}`,
                    );
                  }}
                  disabled={image.previous === null}
                >
                  Previous
                </button>

                <button
                  onClick={() => {
                    navigate(
                      `/collection/${collectionName}/image/${image.next}`,
                    );
                  }}
                  disabled={image.next === null}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
