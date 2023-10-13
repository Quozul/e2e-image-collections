import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { CryptoContext, ImageInformation } from "./CryptoContext.tsx";
import "./image.css";

export default function Image() {
  const navigate = useNavigate();
  const { collection, image: imageName } = useParams();
  const { key, getImage } = useContext(CryptoContext);
  const [image, setImage] = useState<ImageInformation | null>(null);

  useEffect(() => {
    getImage(collection, imageName).then(setImage);
  }, []);

  return (
    <div className="p-20 image-page">
      <div className="row w-100">
        <h1 className="title">{image?.name ?? imageName}</h1>

        <button
          onClick={() => {
            navigate(`/collection/${collection}`);
          }}
        >
          Back to collection
        </button>
      </div>

      {key === null ? (
        <div>No decryption key provided</div>
      ) : image === null ? (
        <div>Image not found</div>
      ) : (
        <img className="image" src={image.url} alt={image.name} />
      )}
    </div>
  );
}
