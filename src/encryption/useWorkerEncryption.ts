import mime from "mime";
import { useCallback, useEffect, useState } from "react";
import { DecryptionJob } from "./worker/DecryptionJob.ts";
import { EncryptionJob } from "./worker/EncryptionJob.ts";
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
		if (!worker) {
			throw new Error("Worker is not ready");
		}
		if (!password) {
			alert("Password is required");
			throw new Error("Password is required");
		}
		const job = new EncryptionJob(worker, file);
		job.addEventListener("onprogress", (event) => {
			setProgress(event.progress);
		});
		job.addEventListener("onerror", (event) => {
			alert(event.error);
		});
		job.addEventListener("oncomplete", () => {
			refresh();
		});
		job.startJob();
	};

	const decryptBlob = async (fileName: string): Promise<void> => {
		if (!worker) {
			throw new Error("Worker is not ready");
		}
		if (!password) {
			alert("Password is required");
			throw new Error("Password is required");
		}
		const job = new DecryptionJob(worker, fileName);
		job.addEventListener("onprogress", (event) => {
			setProgress(event.progress);
		});
		job.addEventListener("onerror", (event) => {
			alert(event.error);
		});
		job.addEventListener("oncomplete", (event) => {
			const preview: FilePreview = {
				type: mime.getType(event.fileName),
				blob: event.blob,
				name: event.fileName,
			};
			setPreview(preview);
		});
		job.startJob();
	};

	useEffect(() => {
		const worker = new ApiEncryptionWorker();
		const handleMessage = (event: MessageEvent) => {
			const message: ApiEncryptionWorkerMessage = event.data;
			if (message.type === "passwordReceived") {
				setIsReady(true);
			}
		};
		worker.addEventListener("message", handleMessage);
		setWorker(worker);

		return () => {
			worker.removeEventListener("message", handleMessage);
		};
	}, []);

	useEffect(() => {
		if (worker) {
			sendMessage({
				type: "password",
				password,
			});
		}
	}, [sendMessage, worker, password]);

	return { progress, encryptBlob, isReady, decryptBlob, preview, setPreview };
}
