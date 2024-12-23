import type {
	ClientMessages,
	WorkerMessages,
} from "@/encryption/worker/messages.ts";
import { PasswordKey } from "../PasswordKey.ts";
import { ProgressEncryption } from "../ProgressEncryption.ts";

globalThis.onmessage = async (e) => {
	const message: ClientMessages = e.data;
	switch (message.type) {
		case "setPassword":
			handlePassword(message.password, message.jobId);
			break;
		case "startEncryptJob":
			await handleEncryptionJob(message.file, message.jobId);
			break;
		case "startDecryptJob":
			await handleDecryptionJob(message.fileName, message.jobId);
			break;
		default:
			sendError("Unhandled message received", -1);
			break;
	}
};

let encryption: ProgressEncryption | null = null;

function handlePassword(password: string, jobId: number) {
	sendMessage({ type: "passwordReceived", jobId });

	PasswordKey.load(password)
		.then((passwordKey) => new ProgressEncryption(passwordKey))
		.then((blobEncryption) => {
			encryption = blobEncryption;
		});
}

async function handleEncryptionJob(file: File, jobId: number) {
	if (encryption === null) {
		return sendError("Password must be set first", jobId);
	}

	try {
		const generator = encryption.encryptFile(file);
		for await (const progress of generator) {
			sendMessage({ type: "encryptProgress", progress, jobId });
		}
		sendMessage({ type: "encryptComplete", jobId });
	} catch (error) {
		sendError(error, jobId);
	}
}

async function handleDecryptionJob(fileName: string, jobId: number) {
	if (encryption === null) {
		return sendError("Password must be set first", jobId);
	}
	try {
		const generator = encryption.decryptBlob(fileName);

		let result: IteratorResult<number | Blob>;
		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
		while (!(result = await generator.next()).done) {
			if (typeof result.value === "number") {
				sendMessage({ type: "decryptProgress", progress: result.value, jobId });
			}
		}
		sendMessage({
			type: "decryptComplete",
			blob: result.value,
			fileName,
			jobId,
		});
	} catch (error) {
		sendError(error, jobId);
	}
}

function sendMessage(message: WorkerMessages) {
	globalThis.postMessage(message);
}

function sendError(error: unknown, jobId: number) {
	console.error(error);
	sendMessage({ type: "error", error, jobId });
}
