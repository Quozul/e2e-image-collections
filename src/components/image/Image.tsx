import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { CryptoContext, ImageInformation } from "../CryptoContext.tsx";
import "./image.css";
import Password from "../password/Password.tsx";

export default function Image() {
  const navigate = useNavigate();
  const { collection, image: imageName } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const { key, getImage } = useContext(CryptoContext);
  const [image, setImage] = useState<ImageInformation | null>(null);

  useEffect(() => {
    getImage(collection, imageName)
      .then(setImage)
      .catch(() => {
        setImage(null);
      });
  }, [collection, imageName, key]);

  return (
    <div className="image-page">
      <div className="row w-100">
        <h1 className="title">{image?.name ?? imageName}</h1>

        <button
          onClick={() => {
            navigate(`/collection/${collection}`);
          }}
        >
          Back to collection
        </button>
      </div>

      <div className="image-row">
        {image === null ? (
          <div className="image image-status p-20">
            <h1>
              <i className="bi bi-file-earmark-lock"></i>
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
                <span>Description</span>
                <textarea
                  onInput={({ currentTarget }) => {
                    currentTarget.style.height = "";
                    currentTarget.style.height =
                      currentTarget.scrollHeight - 16 + "px";
                  }}
                  onBlur={({ currentTarget }) => {
                    console.log("change", currentTarget.value);
                  }}
                  placeholder="Enter a description for this file."
                />
              </div>

              <div className="file-row actions">
                <button
                  onClick={() => {
                    navigate(
                      `/collection/${collection}/image/${image.previous}`,
                    );
                  }}
                  disabled={image.previous === null}
                >
                  Previous
                </button>

                <button
                  onClick={() => {
                    navigate(`/collection/${collection}/image/${image.next}`);
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
