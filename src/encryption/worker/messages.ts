type WorkerMessage<T extends string> = {
	type: T;
};

// Sent by the browser

type PasswordMessage = WorkerMessage<"password"> & {
	password: string;
};

type EncryptBlobMessage = WorkerMessage<"encryptBlob"> & {
	file: File;
};

type DecryptBlobMessage = WorkerMessage<"decryptBlob"> & {
	fileName: string;
};

// Sent by the worker

type PasswordReceived = WorkerMessage<"passwordReceived">;

type ProgressMessage = WorkerMessage<"progress"> & {
	progress: number;
};

type DecryptedMessage = WorkerMessage<"decryptedBlob"> & {
	blob: Blob;
	fileName: string;
};

type UploadDoneMessage = WorkerMessage<"uploadDone">;

type ErrorMessage = WorkerMessage<"error"> & {
	error: unknown;
};

export type ApiEncryptionWorkerMessage =
	| PasswordMessage
	| DecryptBlobMessage
	| EncryptBlobMessage
	| PasswordReceived
	| ProgressMessage
	| DecryptedMessage
	| ErrorMessage
	| UploadDoneMessage;
