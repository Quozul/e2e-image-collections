import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getKey } from "~/helpers/encryption";
import { CryptoContext } from "~/components/CryptoContext";
import { classNames } from "~/helpers/classNames";

const COLLECTION_RE = /^[a-z0-9-_.~]{1,32}$/;

function App() {
  const navigate = useNavigate();
  const { setKey } = useContext(CryptoContext);

  const [password, setPassword] = useState<string>("");
  const [errorOpeningCollection, setErrorOpeningCollection] = useState<boolean>(false);
  const [invalidCollectionName, setInvalidCollectionName] = useState<boolean>(false);
  const [collection, setCollection] = useState<string>("");

  const classes = classNames({
    "border-danger": invalidCollectionName,
  });

  return (
    <div className="flex-col p-2">
      <h1>Open a collection</h1>

      <form
        className="flex-col w-100"
        onSubmit={async (event) => {
          event.preventDefault();
          setErrorOpeningCollection(false);
          if (event.currentTarget.checkValidity()) {
            getKey(password).then(setKey);
            try {
              setPassword("");
              navigate(`/collection/${collection}`);
            } catch (e) {
              console.error(e);
              setErrorOpeningCollection(true);
            }
          }
        }}
      >
        <label className="flex-col">
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
            <div className="text-danger">
              Collection names must be 1-32 characters long and can only include lowercase letters, numbers, and the special characters - _
              . ~
            </div>
          )}
        </label>

        <label className="flex-col">
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

        <div className="flex align-center">
          <button disabled={!collection || invalidCollectionName}>Open collection</button>
          {errorOpeningCollection && <div className="invalid">An error has occurred while opening the collection.</div>}
        </div>
      </form>
    </div>
  );
}

export default App;
