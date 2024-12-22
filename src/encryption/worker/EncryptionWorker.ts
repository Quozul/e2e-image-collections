import { PasswordKey } from "../PasswordKey.ts";
import { ProgressEncryption } from "../ProgressEncryption.ts";
import type { ApiEncryptionWorkerMessage } from "./messages.ts";

globalThis.onmessage = async (e) => {
	const message: ApiEncryptionWorkerMessage = e.data;
	switch (message.type) {
		case "password":
			handlePassword(message.password);
			break;
		case "encryptBlob":
			await handleBlob(message.file);
			break;
		case "decryptBlob":
			await handleDecrypt(message.fileName);
			break;
		default:
			sendError(`Unknown message type ${message.type}`);
			break;
	}
};

let encryption: ProgressEncryption | null = null;

function handlePassword(password: string) {
	sendMessage({ type: "passwordReceived" });

	PasswordKey.load(password)
		.then((passwordKey) => new ProgressEncryption(passwordKey))
		.then((blobEncryption) => {
			encryption = blobEncryption;
		});
}

async function handleBlob(file: File) {
	if (encryption === null) {
		return sendError("Password must be set first");
	}

	try {
		const generator = encryption.encryptFile(file);
		for await (const progress of generator) {
			sendMessage({ type: "progress", progress });
		}
		sendMessage({ type: "uploadDone" });
	} catch (error) {
		sendError(error);
	}
}

async function handleDecrypt(fileName: string) {
	if (encryption === null) {
		return sendError("Password must be set first");
	}
	try {
		const generator = encryption.decryptBlob(fileName);

		let result: IteratorResult<number | Blob>;
		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
		while (!(result = await generator.next()).done) {
			if (typeof result.value === "number") {
				sendMessage({ type: "progress", progress: result.value });
			}
		}
		sendMessage({ type: "decryptedBlob", blob: result.value, fileName });
	} catch (error) {
		sendError(error);
	}
}

function sendMessage(message: ApiEncryptionWorkerMessage) {
	globalThis.postMessage(message);
}

function sendError(error: unknown) {
	console.error(error);
	sendMessage({ type: "error", error });
}
