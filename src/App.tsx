import { useState, useEffect } from "react";
import { encrypt, getKey } from "./encryption.ts";
import {
  createCollection,
  getCollectionContent,
  uploadFile,
} from "./collection.ts";
import EncryptedImage from "./EncryptedImage.tsx";
import "./app.css";

// TODO: Generate random IV
export const IV = new Uint8Array([
  124, 124, 124, 124, 124, 124, 124, 124, 124, 124, 124, 124, 124, 124, 124,
  124,
]);

function App() {
  const [password, setPassword] = useState<string>("");
  const [visibleModal, setVisibleModal] = useState<string | null>(null);
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [collection, setCollection] = useState<string>("");
  const [content, setContent] = useState([]);

  function refresh() {
    createCollection(collection).then(setContent);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="column p-20">
      <form
        className="form row w-100"
        onSubmit={(event) => {
          event.preventDefault();
          getKey(password).then(setKey);
          refresh();
          setPassword("");
        }}
      >
        <input
          type="text"
          placeholder="Collection"
          value={collection}
          onInput={({ currentTarget }) => {
            setCollection(currentTarget.value);
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onInput={({ currentTarget }) => {
            setPassword(currentTarget.value);
          }}
        />

        <button disabled={!collection}>Open collection</button>
      </form>

      {key !== null && (
        <>
          <div className="center w-100">
            <input
              className="w-100"
              type="file"
              multiple
              onChange={async ({ currentTarget }) => {
                for (const file of currentTarget.files) {
                  const buffer = await file.arrayBuffer();
                  const encrypted = await encrypt(key, buffer, IV);
                  await uploadFile(collection, file.name, encrypted);
                }

                setContent(await createCollection(collection));
              }}
            />
          </div>

          <div className="container">
            {content.length === 0
              ? "The collection is empty"
              : content.map((name) => (
                  <EncryptedImage
                    isModalVisible={name === visibleModal}
                    setIsModalVisible={(isVisible) => {
                      if (isVisible) {
                        setVisibleModal(name);
                      } else {
                        setVisibleModal(null);
                      }
                    }}
                    collection={collection}
                    name={name}
                    refresh={refresh}
                    key={name}
                    cryptoKey={key}
                  />
                ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
