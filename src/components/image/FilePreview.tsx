import { CollectionItem, deleteFile } from "~/helpers/api";
import ImageViewer from "~/components/image/ImageViewer";
import { useNavigate } from "react-router-dom";
import useImage from "~/components/image/useImage";
import { useState } from "react";

type Props = {
  collection: CollectionItem;
  refreshCollection: () => void;
  imageName: string;
};

export default function FilePreview({ collection, refreshCollection, imageName }: Props) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const image = useImage(collection, imageName);

  return (
    <div className="flex-col overflow-hidden image-page p-2">
      <div className="flex justify-space-between w-100">
        <h1 className="text-ellipsis" title={image.fileName}>
          {image.fileName}
        </h1>

        <button
          onClick={() => {
            navigate(`/collection/${collection.name}`);
          }}
        >
          Back to collection
        </button>
      </div>

      <div className="grid cols-1 lg:cols-2-1 overflow-hidden">
        <ImageViewer
          file={image.file}
          className="h-100 object-fit-contain overflow-hidden rounded-1 flex-col align-center"
          onClick={() => {
            if (image.file.url !== null) {
              window.open(image.file.url, "_blank");
            }
          }}
          onLoad={image.onImageLoad}
        />

        <div className="list-group">
          <div className="list-entry grid cols-2">
            <span>Name</span>
            <span className="text-ellipsis" title={image.fileName}>
              {image.fileName}
            </span>
          </div>

          <div className="list-entry grid cols-2">
            <span>Size</span>
            <span>{image.formattedFileSize}</span>
          </div>

          <div className="list-entry grid cols-2">
            <span>Type</span>
            <span>{image.file.file?.type || "unknown"}</span>
          </div>

          <div className="list-entry grid cols-2">
            <span>Index</span>
            <span>{image.indexInCollection}</span>
          </div>

          {image.shouldDisplayDimensions && (
            <div className="list-entry grid cols-2">
              <span>Dimensions</span>
              <span>{image.dimensions}</span>
            </div>
          )}

          <div className="list-entry grid cols-3">
            <button
              onClick={() => {
                if (image.previousImageUrl !== null) {
                  navigate(image.previousImageUrl);
                }
              }}
              disabled={image.previousImageUrl === null}
            >
              Previous
            </button>

            <button
              onClick={() => {
                if (image.nextImageUrl !== null) {
                  navigate(image.nextImageUrl);
                }
              }}
              disabled={image.nextImageUrl === null}
            >
              Next
            </button>

            <button
              onClick={async () => {
                setIsDeleting(true);
                try {
                  await deleteFile(collection.name, imageName);
                  refreshCollection();
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
      </div>
    </div>
  );
}
