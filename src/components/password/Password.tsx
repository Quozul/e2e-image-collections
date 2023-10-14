import { HTMLProps, useContext, useState } from "react";
import { getKey } from "~/helpers/encryption";
import { CryptoContext } from "~/components/CryptoContext";

export default function Password(props: HTMLProps<HTMLInputElement>) {
  const { setKey } = useContext(CryptoContext);
  const [password, setPassword] = useState<string>("");

  return (
    <form
      className="form row"
      onSubmit={async (event) => {
        event.preventDefault();
        getKey(password).then(setKey);
        setPassword("");
      }}
    >
      <input
        type="password"
        placeholder="Password"
        autoComplete="off"
        value={password}
        onInput={({ currentTarget }) => {
          setPassword(currentTarget.value);
        }}
        {...props}
      />
    </form>
  );
}
