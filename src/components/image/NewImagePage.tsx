import { useParams } from "react-router-dom";
import useCollection from "~/components/collection/useCollection";
import FullImageViewer from "~/components/image/FullImageViewer";

export default function NewImagePage() {
  const { collection: collectionName, image: imageName } = useParams();

  const { collection } = useCollection(collectionName!);

  return collection && <FullImageViewer collection={collection} imageName={imageName!} />;
}
