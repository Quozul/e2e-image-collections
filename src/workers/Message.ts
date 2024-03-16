type PasswordMessage = {
  type: "password";
  password: string;
};

type DownloadMessage = {
  type: "download";
  collectionName: string;
  imageName: string;
};

type UploadMessage = {
  type: "upload";
  collectionName: string;
  files: FileSystemDirectoryHandle | FileList;
};

export type Message = PasswordMessage | UploadMessage | DownloadMessage;
