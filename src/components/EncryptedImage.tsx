import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteFile } from "~/helpers/api";
import useOnScreen from "~/hooks/useOnScreen";
import { ImageInformation } from "~/components/CryptoContext";
import { classNames } from "~/helpers/classNames";
import ImageViewer from "~/components/image/ImageViewer";
import useCollection from "~/components/collection/useCollection";

type Props = {
  collectionName: string;
  imageName: string;
  cover: boolean;
};

function EncryptedImage({ collectionName, imageName, cover }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);
  const [wasVisible, setWasVisible] = useState(isVisible);
  const navigate = useNavigate();
  const { collection, refresh } = useCollection(collectionName);
  const [image, setImage] = useState<ImageInformation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const name = image?.name ?? imageName;

  useEffect(() => {
    if (isVisible) {
      setWasVisible(isVisible);
    }
  }, [isVisible]);

  const imageClasses = classNames({
    "rounded-1 grow-1 aspect-ratio-square justify-center flex-col align-center": true,
    "object-fit-cover": cover,
    "object-fit-contain": !cover,
  });

  return (
    <div className="flex-col p-1 bg-background-muted rounded-1 overflow-hidden" ref={ref}>
      {collection && (
        <ImageViewer
          collectionName={collectionName}
          className={imageClasses}
          imageName={imageName}
          collectionFiles={collection.files}
          onClick={() => {
            navigate(`/collection/${collectionName}/image/${imageName}`);
          }}
        />
      )}

      <div className="flex justify-space-between align-center">
        <span className="text-ellipsis" title={name}>
          {name}
        </span>

        <button
          onClick={async () => {
            setIsDeleting(true);
            try {
              await deleteFile(collectionName, imageName);
              refresh();
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
