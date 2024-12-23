type WorkerMessage<T extends string> = {
	type: T;
	jobId: number;
};

// Sent by the browser

type setPasswordMessage = WorkerMessage<"setPassword"> & {
	password: string;
};

type StartEncryptJobMessage = WorkerMessage<"startEncryptJob"> & {
	file: File;
};

type StartDecryptJobMessage = WorkerMessage<"startDecryptJob"> & {
	fileName: string;
};

// Sent by the worker

type PasswordReceivedMessage = WorkerMessage<"passwordReceived">;

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

export type ClientMessages =
	| setPasswordMessage
	| StartDecryptJobMessage
	| StartEncryptJobMessage;

export type WorkerMessages =
	| PasswordReceivedMessage
	| DecryptProgressMessage
	| EncryptProgressMessage
	| DecryptJobCompletedMessage
	| ErrorMessage
	| EncryptJobCompletedMessage;
