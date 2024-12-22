import { useCallback, useEffect, useState } from "react";
import { download } from "../utils/download.ts";
import ApiEncryptionWorker from "./worker/EncryptionWorker.ts?worker";
import type { ApiEncryptionWorkerMessage } from "./worker/messages.ts";

export function useWorkerEncryption(password: string) {
	const [isReady, setIsReady] = useState(false);
	const [worker, setWorker] = useState<Worker>();
	const [progress, setProgress] = useState(0);

	const handleMessage = useCallback((event: MessageEvent) => {
		const message: ApiEncryptionWorkerMessage = event.data;
		switch (message.type) {
			case "passwordReceived":
				setIsReady(true);
				break;
			case "progress":
				setProgress(message.progress);
				break;
			case "decryptedBlob":
				console.log(message.blob);
				download(message.blob, message.fileName);
				break;
			default:
				console.error(`Unknown message type ${message.type}`);
				break;
		}
	}, []);

	const encryptBlob = useCallback(
		async (file: File): Promise<void> => {
			if (!isReady || !worker) {
				throw new Error("Worker is already ready");
			}
			const message: ApiEncryptionWorkerMessage = {
				type: "encryptBlob",
				file,
			};
			worker.postMessage(message);
		},
		[worker, isReady],
	);

	const decryptBlob = useCallback(
		async (fileName: string): Promise<void> => {
			if (!isReady || !worker) {
				throw new Error("Worker is already ready");
			}
			const message: ApiEncryptionWorkerMessage = {
				type: "decryptBlob",
				fileName,
			};
			worker.postMessage(message);
		},
		[worker, isReady],
	);

	useEffect(() => {
		const worker = new ApiEncryptionWorker();
		worker.addEventListener("message", handleMessage);
		setWorker(worker);
	}, [handleMessage]);

	useEffect(() => {
		if (worker) {
			const message: ApiEncryptionWorkerMessage = {
				type: "password",
				password: password,
			};

			worker.postMessage(message);
		}
	}, [worker, password]);

	return { progress, encryptBlob, isReady, decryptBlob };
}
