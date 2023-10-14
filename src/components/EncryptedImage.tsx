import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteFile } from "~/components/collection/collection";
import useOnScreen from "~/hooks/useOnScreen";
import { CryptoContext, ImageInformation } from "~/components/CryptoContext";
import { classNames } from "~/helpers/classNames";
import Password from "~/components/password/Password";

type Props = {
  collectionName: string;
  imageName: string;
};

function EncryptedImage({ collectionName, imageName }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);
  const navigate = useNavigate();
  const { getImage, getCollection, key } = useContext(CryptoContext);
  const [image, setImage] = useState<ImageInformation | null>(null);

  const name = image?.name ?? imageName;

  useEffect(() => {
    if (isVisible && image === null) {
      setIsLoading(true);

      getImage(collectionName, imageName)
        .then((image) => {
          setIsLoading(image.type?.startsWith("image/") ?? false);
          setImage(image);
          setError(false);
        })
        .catch((err) => {
          console.error(err);
          setError(true);
        });
    }
  }, [isVisible, image, collectionName, imageName, key]);

  const imageClasses = classNames({
    image: true,
    loading: isLoading,
  });

  return (
    <div className="image-container" ref={ref}>
      {image === null ? (
        <div className="image image-status">
          <h1>
            <i className="bi bi-shield-lock"></i>
          </h1>
          File is encrypted
          <Password placeholder="Enter password to decrypt" />
        </div>
      ) : (
        isLoading && (
          <div className="image image-status">
            <h1>
              <i className="bi bi-hourglass"></i>
            </h1>
            Image is loading
          </div>
        )
      )}

      {image !== null &&
        (image?.type?.startsWith("image/") ? (
          <img
            alt={name}
            onClick={() => {
              navigate(`/collection/${collectionName}/image/${imageName}`);
            }}
            className={imageClasses}
            src={image.url}
            onLoad={() => {
              setIsLoading(false);
            }}
          />
        ) : (
          <div className="image image-status">
            <h1>
              <i className="bi bi-file-earmark"></i>
            </h1>
            Cannot display file preview
          </div>
        ))}

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
