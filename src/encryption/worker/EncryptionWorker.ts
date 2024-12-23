import type {
	ClientMessages,
	WorkerMessages,
} from "@/encryption/worker/messages.ts";
import { PasswordKey } from "../PasswordKey.ts";
import { ProgressEncryption } from "../ProgressEncryption.ts";

globalThis.onmessage = async (e) => {
	const message: ClientMessages = e.data;
	switch (message.type) {
		case "startEncryptJob":
			await handleEncryptionJob(message.file, message.jobId, message.password);
			break;
		case "startDecryptJob":
			await handleDecryptionJob(
				message.fileName,
				message.jobId,
				message.password,
			);
			break;
		default:
			sendError("Unhandled message received", -1);
			break;
	}
};

async function instantiateEncryption(
	password: string,
): Promise<ProgressEncryption> {
	const passwordKey = await PasswordKey.load(password);
	return new ProgressEncryption(passwordKey);
}

async function handleEncryptionJob(
	file: File,
	jobId: number,
	password: string,
) {
	const encryption = await instantiateEncryption(password);

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

async function handleDecryptionJob(
	fileName: string,
	jobId: number,
	password: string,
) {
	const encryption = await instantiateEncryption(password);

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
