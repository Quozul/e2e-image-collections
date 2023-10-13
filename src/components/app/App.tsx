import { useContext, useState } from "react";
import { getKey } from "../../helpers/encryption.ts";
import "./app.css";
import { useNavigate } from "react-router-dom";
import { CryptoContext } from "../CryptoContext.tsx";
import { classNames } from "../../helpers/classNames.ts";

const COLLECTION_RE = /^[a-z0-9-_.~]{1,32}$/;

function App() {
  const navigate = useNavigate();
  const { setKey, getCollection } = useContext(CryptoContext);

  const [password, setPassword] = useState<string>("");
  const [invalidCollectionName, setInvalidCollectionName] =
    useState<boolean>(false);
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
          if (event.currentTarget.checkValidity()) {
            getKey(password).then(setKey);
            setPassword("");
            await getCollection(collection);
            navigate(`/collection/${collection}`);
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
            pattern="^[a-z0-9-_.~]{1,32}$"
            onInput={({ currentTarget }) => {
              if (!COLLECTION_RE.test(currentTarget.value)) {
                setInvalidCollectionName(true);
              } else {
                setInvalidCollectionName(false);
              }
              setCollection(currentTarget.value);
            }}
          />
          {invalidCollectionName && collection.length > 0 && (
            <div className="invalid">
              Collection names must be 1-32 characters long and can only include
              lowercase letters, numbers, and the special characters - _ . ~
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

        <button disabled={!collection || invalidCollectionName}>
          Open collection
        </button>
      </form>
    </div>
  );
}

export default App;
