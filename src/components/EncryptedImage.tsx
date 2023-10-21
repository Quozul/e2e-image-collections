import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteFile } from "~/helpers/api";
import useOnScreen from "~/hooks/useOnScreen";
import { CryptoContext, ImageInformation } from "~/components/CryptoContext";
import { classNames } from "~/helpers/classNames";
import Password from "~/components/password/Password";

type Props = {
  collectionName: string;
  imageName: string;
  cover: boolean;
};

function EncryptedImage({ collectionName, imageName, cover }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);
  const navigate = useNavigate();
  const { getImage, getCollection, key } = useContext(CryptoContext);
  const [image, setImage] = useState<ImageInformation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    "rounded-1 grow-1 aspect-ratio-square cursor-pointer justify-center flex-col align-center": true,
    "object-fit-cover": cover,
    "object-fit-contain": !cover,
    none: isLoading,
  });

  return (
    <div className="flex-col p-1 bg-background-muted rounded-1 overflow-hidden" ref={ref}>
      {image === null ? (
        <div className="rounded-1 aspect-ratio-square justify-center flex-col align-center">
          <h1>
            <i className="bi bi-shield-lock" />
          </h1>
          File is encrypted
          <Password placeholder="Enter password to decrypt" />
        </div>
      ) : (
        isLoading && (
          <div className="rounded-1 aspect-ratio-square justify-center flex-col align-center">
            <h1>
              <i className="bi bi-hourglass" />
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
          <div
            onClick={() => {
              navigate(`/collection/${collectionName}/image/${imageName}`);
            }}
            className="rounded-1 aspect-ratio-square justify-center flex-col align-center cursor-pointer"
          >
            <h1>
              <i className="bi bi-file-earmark" />
            </h1>
            Cannot display file preview
          </div>
        ))}

      <div className="flex justify-space-between align-center">
        <span className="text-ellipsis" title={name}>
          {name}
        </span>

        <button
          onClick={async () => {
            setIsDeleting(true);
            try {
              await deleteFile(collectionName, imageName);
              await getCollection(collectionName, true);
            } finally {
              setIsDeleting(false);
            }
          }}
          className="danger"
          disabled={isDeleting}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default EncryptedImage;
