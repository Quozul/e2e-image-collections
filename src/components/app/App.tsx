import { useContext, useState } from "react";
import { getKey } from "../../helpers/encryption.ts";
import "./app.css";
import { useNavigate } from "react-router-dom";
import { CryptoContext } from "../CryptoContext.tsx";

function App() {
  const navigate = useNavigate();
  const { setKey, getCollection } = useContext(CryptoContext);

  const [password, setPassword] = useState<string>("");
  const [collection, setCollection] = useState<string>("");

  return (
    <div className="column p-20">
      <h1>Open a collection</h1>

      <form
        className="form row w-100"
        onSubmit={async (event) => {
          event.preventDefault();
          getKey(password).then(setKey);
          setPassword("");
          await getCollection(collection);
          navigate(`/collection/${collection}`);
        }}
      >
        <input
          type="text"
          placeholder="Collection"
          autoComplete="off"
          value={collection}
          onInput={({ currentTarget }) => {
            setCollection(currentTarget.value);
          }}
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="off"
          value={password}
          onInput={({ currentTarget }) => {
            setPassword(currentTarget.value);
          }}
        />

        <button disabled={!collection}>Open collection</button>
      </form>
    </div>
  );
}

export default App;
