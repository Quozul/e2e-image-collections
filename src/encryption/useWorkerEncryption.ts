import type {
	ClientMessages,
	WorkerMessages,
} from "@/encryption/worker/messages.ts";
import mime from "mime";
import { useCallback, useEffect, useState } from "react";
import { DecryptionJob } from "./worker/DecryptionJob.ts";
import { EncryptionJob } from "./worker/EncryptionJob.ts";
import ApiEncryptionWorker from "./worker/EncryptionWorker.ts?worker";

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
		(message: ClientMessages) => {
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
			console.log("complete");
			setPreview(preview);
		});
		job.startJob();
	};

	useEffect(() => {
		const worker = new ApiEncryptionWorker();
		const handleMessage = (event: MessageEvent) => {
			const message: WorkerMessages = event.data;
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
				type: "setPassword",
				password,
				jobId: -1,
			});
		}
	}, [sendMessage, worker, password]);

	return { progress, encryptBlob, isReady, decryptBlob, preview, setPreview };
}
