import { useEffect, useState } from "react";

export default function useDescription(defaultValue: string) {
  const [newDescription, setNewDescription] = useState<string>("");

  useEffect(() => {
    setNewDescription(defaultValue);
  }, [defaultValue]);
}
