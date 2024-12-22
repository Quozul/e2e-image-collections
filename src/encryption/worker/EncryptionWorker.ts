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
			await handleBlob(message.blob);
			break;
		default:
			console.error(`Unknown message type ${message.type}`);
			break;
	}
};

let encryption: ProgressEncryption | null = null;

function handlePassword(password: string) {
	const message: ApiEncryptionWorkerMessage = {
		type: "passwordReceived",
	};
	globalThis.postMessage(message);
	console.log(`Password received: ${password}`);

	PasswordKey.load(password)
		.then((passwordKey) => new ProgressEncryption(passwordKey))
		.then((blobEncryption) => {
			encryption = blobEncryption;
		});
}

async function handleBlob(blob: Blob) {
	if (encryption === null) {
		console.error("Password must be set first");
		return;
	}
	try {
		const generator = encryption.encryptBlob(blob);
		for await (const progress of generator) {
			const progressMessage: ApiEncryptionWorkerMessage = {
				type: "progress",
				progress,
			};
			globalThis.postMessage(progressMessage);
		}
	} catch (error) {
		console.error(error);
	}
}
