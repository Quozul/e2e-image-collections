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
	blob: Blob;
};

// Sent by the worker

type PasswordReceived = WorkerMessage<"passwordReceived">;

type ProgressMessage = WorkerMessage<"progress"> & {
	progress: number;
};

export type ApiEncryptionWorkerMessage =
	| PasswordMessage
	| DecryptBlobMessage
	| EncryptBlobMessage
	| PasswordReceived
	| ProgressMessage;
