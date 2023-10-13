import { useContext, useEffect, useRef, useState } from "react";
import { deleteFile } from "./collection.ts";
import useOnScreen from "./useOnScreen.ts";
import { useNavigate } from "react-router-dom";
import { CryptoContext, ImageInformation } from "./CryptoContext.tsx";

type Props = {
  collectionName: string;
  imageName: string;
};

function EncryptedImage({ collectionName, imageName }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);
  const navigate = useNavigate();
  const { getImage, getCollection } = useContext(CryptoContext);
  const [image, setImage] = useState<ImageInformation | null>(null);

  const name = image?.name ?? imageName;

  useEffect(() => {
    if (isVisible && image === null) {
      setIsLoading(true);

      getImage(collectionName, imageName)
        .then((image) => {
          setImage(image);
          setIsEncrypted(false);
          setError(false);
        })
        .catch((err) => {
          console.error(err);
          setError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isVisible, image, collectionName, imageName]);

  return (
    <div className="image-container" ref={ref}>
      {isEncrypted ? (
        <div className="image image-status">
          <h1>
            <i className="bi bi-file-earmark-lock"></i>
          </h1>
          File is encrypted
        </div>
      ) : image === null ? (
        <div className="image image-status">Image is loading</div>
      ) : (
        <img
          alt={name}
          onClick={() => {
            navigate(`/collection/${collectionName}/image/${imageName}`);
          }}
          className="image"
          src={image.url}
        />
      )}

      <div className="row space-between">
        <span className="image-name" title={name}>
          {name}
        </span>

        <button
          onClick={async () => {
            await deleteFile(collectionName, imageName);
            await getCollection(collectionName, true);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default EncryptedImage;
