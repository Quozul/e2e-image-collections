import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getKey } from "~/helpers/encryption";
import { CryptoContext } from "~/components/CryptoContext";
import { classNames } from "~/helpers/classNames";
import "./app.css";

const COLLECTION_RE = /^[a-z0-9-_.~]{1,32}$/;

function App() {
  const navigate = useNavigate();
  const { setKey, getCollection } = useContext(CryptoContext);

  const [password, setPassword] = useState<string>("");
  const [errorOpeningCollection, setErrorOpeningCollection] = useState<boolean>(false);
  const [invalidCollectionName, setInvalidCollectionName] = useState<boolean>(false);
  const [collection, setCollection] = useState<string>("");

  const classes = classNames({
    invalid: invalidCollectionName,
  });

  return (
    <div className="column p-20">
      <h1>Open a collection</h1>

      <form
        className="form w-100"
        onSubmit={async (event) => {
          event.preventDefault();
          setErrorOpeningCollection(false);
          if (event.currentTarget.checkValidity()) {
            getKey(password).then(setKey);
            try {
              await getCollection(collection);
              setPassword("");
              navigate(`/collection/${collection}`);
            } catch (e) {
              console.error(e);
              setErrorOpeningCollection(true);
            }
          }
        }}
      >
        <label className="label">
          Collection
          <input
            type="text"
            placeholder="Collection"
            className={classes}
            autoComplete="off"
            value={collection}
            required
            onInput={({ currentTarget }) => {
              if (!COLLECTION_RE.test(currentTarget.value)) {
                setInvalidCollectionName(true);
              } else {
                setInvalidCollectionName(false);
              }
              setCollection(currentTarget.value);
            }}
          />
          {invalidCollectionName && (
            <div className="invalid">
              Collection names must be 1-32 characters long and can only include lowercase letters, numbers, and the special characters - _
              . ~
            </div>
          )}
        </label>

        <label className="label">
          Password
          <input
            type="password"
            placeholder="Password"
            autoComplete="off"
            value={password}
            onInput={({ currentTarget }) => {
              setPassword(currentTarget.value);
            }}
          />
        </label>

        <div className="flex">
          <button disabled={!collection || invalidCollectionName}>Open collection</button>
          {errorOpeningCollection && <div className="invalid">An error has occurred while opening the collection.</div>}
        </div>
      </form>
    </div>
  );
}

export default App;
