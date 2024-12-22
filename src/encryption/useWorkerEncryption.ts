import mime from "mime";
import { useCallback, useEffect, useState } from "react";
import ApiEncryptionWorker from "./worker/EncryptionWorker.ts?worker";
import type { ApiEncryptionWorkerMessage } from "./worker/messages.ts";

export type FilePreview = {
	blob: Blob;
	name: string;
	type: string | null;
};

export function useWorkerEncryption(password: string, refresh: () => void) {
	const [isReady, setIsReady] = useState(false);
	const [worker, setWorker] = useState<Worker>();
	const [progress, setProgress] = useState(0);
	const [preview, setPreview] = useState<FilePreview | null>(null);

	const sendMessage = useCallback(
		(message: ApiEncryptionWorkerMessage) => {
			if (!worker) {
				throw new Error("Worker is not ready");
			}
			worker.postMessage(message);
		},
		[worker],
	);

	const encryptBlob = async (file: File): Promise<void> => {
		sendMessage({
			type: "encryptBlob",
			file,
		});
	};

	const decryptBlob = async (fileName: string): Promise<void> => {
		sendMessage({
			type: "decryptBlob",
			fileName,
		});
	};

	useEffect(() => {
		const worker = new ApiEncryptionWorker();
		const handleMessage = (event: MessageEvent) => {
			const message: ApiEncryptionWorkerMessage = event.data;
			if (message.type === "passwordReceived") {
				setIsReady(true);
			} else if (message.type === "progress") {
				setProgress(message.progress);
			} else if (message.type === "decryptedBlob") {
				const preview: FilePreview = {
					type: mime.getType(message.fileName),
					blob: message.blob,
					name: message.fileName,
				};
				setPreview(preview);
			} else if (message.type === "uploadDone") {
				refresh();
			} else if (message.type === "error") {
				alert(message.error);
			} else {
				console.error(`Unknown message type ${message.type}`);
			}
		};
		worker.addEventListener("message", handleMessage);
		setWorker(worker);

		return () => {
			worker.removeEventListener("message", handleMessage);
		};
	}, [refresh]);

	useEffect(() => {
		if (worker) {
			sendMessage({
				type: "password",
				password,
			});
		}
	}, [sendMessage, worker, password]);

	return { progress, encryptBlob, isReady, decryptBlob, preview };
}
