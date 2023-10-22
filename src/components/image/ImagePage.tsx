import { useNavigate, useParams } from "react-router-dom";
import Password from "~/components/password/Password";
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
    url,
  } = useImage(String(collectionName), String(imageName));

  function enlargeImage() {
    if (image !== null) {
      window.open(url, "_blank");
    }
  }

  return (
    <div className="flex-col overflow-hidden image-page p-2">
      <div className="flex justify-space-between w-100">
        <h1 className="text-ellipsis">{image?.name ?? imageName}</h1>

        <button
          onClick={() => {
            navigate(`/collection/${collectionName}`);
          }}
        >
          Back to collection
        </button>
      </div>

      <div className="grid cols-1 lg:cols-2-1 overflow-hidden">
        {image === null ? (
          <div className="overflow-hidden rounded-1 flex-col align-center p-6">
            <h1>
              <i className="bi bi-shield-lock" />
            </h1>
            File is encrypted
            <Password placeholder="Enter password to decrypt" />
          </div>
        ) : (
          isLoading && (
            <div className="overflow-hidden rounded-1 flex-col align-center p-6">
              <h1>
                <i className="bi bi-hourglass" />
              </h1>
              Image is loading
            </div>
          )
        )}

        {image !== null && (
          <>
            {image?.type?.startsWith("image/") ? (
              <img
                className="h-100 object-fit-contain overflow-hidden rounded-1 cursor-zoom-in"
                src={url}
                alt={image.name}
                onLoad={onImageLoad}
                onClick={enlargeImage}
              />
            ) : (
              <div
                onClick={() => {
                  navigate(`/collection/${collectionName}/image/${imageName}`);
                }}
                className="overflow-hidden rounded-1 flex-col align-center p-6"
              >
                <h1>
                  <i className="bi bi-file-earmark" />
                </h1>
                Cannot display file preview
                <button onClick={enlargeImage}>Download</button>
              </div>
            )}

            <div className="list-group">
              <div className="list-entry grid cols-2">
                <span>Name</span>
                <span className="text-ellipsis" title={image.name}>
                  {image.name}
                </span>
              </div>

              <div className="list-entry grid cols-2">
                <span>Size</span>
                <span>{image.size}</span>
              </div>

              <div className="list-entry grid cols-2">
                <span>Type</span>
                <span>{image.type || "unknown"}</span>
              </div>

              <div className="list-entry grid cols-2">
                <span>Index</span>
                <span>{image.index}</span>
              </div>

              {image.type?.startsWith("image/") && (
                <div className="list-entry grid cols-2">
                  <span>Dimensions</span>
                  <span>{dimensions}</span>
                </div>
              )}

              <div className="list-entry grid cols-2">
                <span className="flex">
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

              <div className="list-entry grid cols-2">
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
