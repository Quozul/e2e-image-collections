import { getType } from "mime";

export default function safeMime(fileName: string) {
  const extension = fileName.split(".").pop();

  if (!extension) {
    return null;
  }

  return getType(extension);
}
