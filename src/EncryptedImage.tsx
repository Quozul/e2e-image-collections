import { useState, useEffect, HTMLProps, useRef } from "react";
import { decrypt } from "./encryption.ts";
import { createPortal } from "react-dom";
import { IV } from "./App.tsx";
import { deleteFile } from "./collection.ts";
import useOnScreen from "./useOnScreen.ts";
import Modal from "./Modal.tsx";

type Props = {
  collection: string;
  name: string;
  isModalVisible: boolean;
  setIsModalVisible: (isVisible: boolean) => void;
  refresh: () => void;
  cryptoKey: CryptoKey;
} & HTMLProps<HTMLImageElement>;

function EncryptedImage({
  collection,
  name,
  refresh,
  cryptoKey,
  openedModal,
  isModalVisible,
  setIsModalVisible,
  ...rest
}: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const isVisible = useOnScreen(ref);

  useEffect(() => {
    setError(false);
  }, [collection, name, cryptoKey]);

  useEffect(() => {
    if (isVisible && !isLoading && !url && !error) {
      setIsLoading(true);
      fetch(
        `${window.location.protocol}//${window.location.hostname}:8000/api/collection/${collection}/image/${name}`,
      )
        .then((res) => res.arrayBuffer())
        .then(async (buffer) => {
          const decrypted = await decrypt(cryptoKey, buffer, IV);
          setUrl(URL.createObjectURL(decrypted));
          setError(false);
        })
        .catch(() => {
          setError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isVisible, collection, name, isLoading, url, cryptoKey, error]);

  return (
    <div className="image-container">
      <img
        onClick={() => {
          setIsModalVisible(true);
        }}
        src={url ?? ""}
        ref={ref}
        {...rest}
      />

      {isModalVisible &&
        createPortal(
          <Modal
            name={name}
            src={url}
            onClose={() => setIsModalVisible(false)}
          />,
          document.body,
        )}

      <div className="row space-between">
        <span className="image-name">{name}</span>

        <button
          onClick={async () => {
            await deleteFile(collection, name);
            await refresh();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default EncryptedImage;
