import { useState, useEffect } from "react";
import { encrypt, extractBytesFromString, getKey } from "./encryption.ts";
import { CollectionItem, createCollection, uploadFile } from "./collection.ts";
import EncryptedImage from "./EncryptedImage.tsx";
import "./app.css";

function App() {
  const [password, setPassword] = useState<string>("");
  const [visibleModal, setVisibleModal] = useState<string | null>(null);
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [collection, setCollection] = useState<string>("");
  const [content, setContent] = useState<CollectionItem | null>(null);

  function refresh() {
    return createCollection(collection)
      .then(setContent)
      .catch(() => setContent(null));
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="column p-20">
      <form
        className="form row w-100"
        onSubmit={async (event) => {
          event.preventDefault();
          getKey(password).then(setKey);
          await refresh();
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
                try {
                  for (const file of currentTarget.files) {
                    const buffer = await file.arrayBuffer();
                    const encrypted = await encrypt(
                      key,
                      buffer,
                      extractBytesFromString(content.iv),
                    );
                    await uploadFile(collection, file.name, encrypted);
                  }

                  await refresh();
                } catch (e) {
                  console.error(e);
                }
              }}
            />
          </div>

          <div className="container">
            {content === null
              ? "The collection is empty"
              : content.files.map((name) => (
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
                    iv={content.iv}
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
