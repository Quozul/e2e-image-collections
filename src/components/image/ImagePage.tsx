import { useNavigate, useParams } from "react-router-dom";
import Password from "~/components/password/Password";
import "./image.css";
import useImage from "~/components/image/useImage";

export default function ImagePage() {
  const navigate = useNavigate();
  const { collection: collectionName, image: imageName } = useParams();

  const {
    isLoading,
    newDescription,
    image,
    dimensions,
    onImageLoad,
    isNewDescription,
    updateDescription,
    setNewDescription,
    previousImageUrl,
    nextImageUrl,
  } = useImage(String(collectionName), String(imageName));

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
              <i className="bi bi-shield-lock" />
            </h1>
            File is encrypted
            <Password placeholder="Enter password to decrypt" />
          </div>
        ) : (
          isLoading && (
            <div className="image image-status p-20">
              <h1>
                <i className="bi bi-hourglass" />
              </h1>
              Image is loading
            </div>
          )
        )}

        {image !== null && (
          <>
            <img className="image" src={image.url} alt={image.name} onLoad={onImageLoad} />

            <div className="image-description">
              <div className="file-row">
                <span>Name</span>
                <span className="name">{image.name}</span>
              </div>

              <div className="file-row">
                <span>Size</span>
                <span>{image.size}</span>
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
                <span>Dimensions</span>
                <span>{dimensions}</span>
              </div>

              <div className="file-row">
                <span className="row">
                  Description
                  {isNewDescription && <i className="bi bi-pencil" />}
                </span>

                <textarea
                  onInput={({ currentTarget }) => {
                    currentTarget.style.height = "";
                    currentTarget.style.height = currentTarget.scrollHeight - 16 + "px";
                    setNewDescription(currentTarget.value);
                  }}
                  onBlur={updateDescription}
                  value={newDescription}
                  placeholder="Enter a description for this file."
                />
              </div>

              <div className="file-row actions">
                <button
                  onClick={() => {
                    navigate(previousImageUrl);
                  }}
                  disabled={image.previous === null}
                >
                  Previous
                </button>

                <button
                  onClick={() => {
                    navigate(nextImageUrl);
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
