import { getType } from "mime";

export default async function safeMime(file: File): Promise<string | null> {
  // const fileType = await fileTypeFromStream(file.stream());
  //
  // if (fileType) {
  //   return fileType.mime;
  // }

  const extension = file.name.split(".").pop();

  if (!extension) {
    return null;
  }

  return getType(extension);
}
