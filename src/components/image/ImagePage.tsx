import { useParams } from "react-router-dom";
import useCollection from "~/components/collection/useCollection";
import FilePreview from "~/components/image/FilePreview";

export default function ImagePage() {
  const { collection: collectionName, image: imageName } = useParams();

  const { collection, refresh } = useCollection(collectionName!);

  return collection && <FilePreview refreshCollection={refresh} collection={collection} imageName={imageName!} />;
}
