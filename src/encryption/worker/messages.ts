type WorkerMessage<T extends string> = {
	type: T;
	jobId: number;
};

// Sent by the browser

type StartEncryptJobMessage = WorkerMessage<"startEncryptJob"> & {
	file: File;
	password: string;
};

type StartDecryptJobMessage = WorkerMessage<"startDecryptJob"> & {
	encryptedFileName: string;
	password: string;
};

// Sent by the worker

type DecryptProgressMessage = WorkerMessage<"decryptProgress"> & {
	progress: number;
};

type EncryptProgressMessage = WorkerMessage<"encryptProgress"> & {
	progress: number;
};

type DecryptJobCompletedMessage = WorkerMessage<"decryptComplete"> & {
	blob: Blob;
	fileName: string;
};

type EncryptJobCompletedMessage = WorkerMessage<"encryptComplete">;

type ErrorMessage = WorkerMessage<"error"> & {
	error: unknown;
};

export type ClientMessages = StartDecryptJobMessage | StartEncryptJobMessage;

export type WorkerMessages =
	| DecryptProgressMessage
	| EncryptProgressMessage
	| DecryptJobCompletedMessage
	| ErrorMessage
	| EncryptJobCompletedMessage;
