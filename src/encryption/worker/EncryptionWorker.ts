import { StringEncryption } from "@/encryption/StringEncryption.ts";
import type {
	ClientMessages,
	WorkerMessages,
} from "@/encryption/worker/messages.ts";
import { ProgressEncryption } from "../ProgressEncryption.ts";

globalThis.onmessage = async (e) => {
	const message: ClientMessages = e.data;
	switch (message.type) {
		case "startEncryptJob":
			await handleEncryptionJob(message.file, message.jobId, message.password);
			break;
		case "startDecryptJob":
			await handleDecryptionJob(
				message.encryptedFileName,
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
	return new ProgressEncryption(password);
}

async function encryptString(password: string, input: string): Promise<string> {
	return new StringEncryption().encryptString(input, password);
}

async function decryptString(password: string, input: string): Promise<string> {
	return new StringEncryption().decryptString(input, password);
}

async function handleEncryptionJob(
	file: File,
	jobId: number,
	password: string,
) {
	const encryption = await instantiateEncryption(password);

	try {
		const fileName = await encryptString(password, file.name);
		const generator = encryption.encryptFile(file, fileName);
		for await (const progress of generator) {
			sendMessage({ type: "encryptProgress", progress, jobId });
		}
		sendMessage({ type: "encryptComplete", jobId });
	} catch (error) {
		sendError(error, jobId);
	}
}

async function handleDecryptionJob(
	encryptedFileName: string,
	jobId: number,
	password: string,
) {
	const encryption = await instantiateEncryption(password);

	try {
		const decryptedFileName = await decryptString(password, encryptedFileName);
		const generator = encryption.decryptBlob(encryptedFileName);

		let result: IteratorResult<number | Blob>;
		// biome-ignore lint/suspicious/noAssignInExpressions: explanation
		while (!(result = await generator.next()).done) {
			if (typeof result.value === "number") {
				sendMessage({ type: "decryptProgress", progress: result.value, jobId });
			}
		}

		sendMessage({
			type: "decryptComplete",
			blob: result.value,
			fileName: decryptedFileName,
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
