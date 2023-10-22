import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import { CollectionItem } from "~/helpers/api";
import useOnScreen from "~/hooks/useOnScreen";
import { classNames } from "~/helpers/classNames";
import ImageViewer from "~/components/image/ImageViewer";
import useImage from "~/components/image/useImage";

type Props = {
  imageName: string;
  cover: boolean;
  collection: CollectionItem;
};

export default function EncryptedImage({ collection, imageName, cover }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);
  const navigate = useNavigate();
  const image = useImage(collection, imageName!, isVisible);

  const imageClasses = classNames({
    "rounded-1 grow-1 aspect-ratio-square justify-center flex-col align-center": true,
    "object-fit-cover": cover,
    "object-fit-contain": !cover,
  });

  return (
    <div className="flex-col p-1 bg-background-muted rounded-1 overflow-hidden" ref={ref}>
      {collection && (
        <ImageViewer
          file={image.file}
          className={imageClasses}
          onClick={() => {
            navigate(`/collection/${collection.name}/image/${imageName}`);
          }}
        />
      )}

      <div className="flex justify-space-between align-center">
        <span className="text-ellipsis" title={image.fileName}>
          {image.fileName}
        </span>

        <button
          onClick={() => {
            navigate(`/collection/${collection.name}/image/${imageName}`);
          }}
        >
          View
        </button>
      </div>
    </div>
  );
}
