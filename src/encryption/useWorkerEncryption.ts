import mime from "mime";
import { useMemo, useState } from "react";
import { DecryptionJob } from "./worker/DecryptionJob.ts";
import { EncryptionJob } from "./worker/EncryptionJob.ts";
import ApiEncryptionWorker from "./worker/EncryptionWorker.ts?worker";

export type FilePreview = {
	blob: Blob;
	name: string;
	type: string | null;
};

export function useWorkerEncryption(refresh: () => void) {
	const [progress, setProgress] = useState(0);
	const [preview, setPreview] = useState<FilePreview | null>(null);
	const worker = useMemo(() => new ApiEncryptionWorker(), []);

	const encryptBlob = async (file: File, password: string): Promise<void> => {
		if (!worker) {
			throw new Error("Worker is not ready");
		}
		if (!password) {
			alert("Password is required");
			throw new Error("Password is required");
		}
		const job = new EncryptionJob(worker, file, password);
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

	const decryptBlob = async (
		fileName: string,
		password: string,
	): Promise<void> => {
		if (!worker) {
			throw new Error("Worker is not ready");
		}
		if (!password) {
			alert("Password is required");
			throw new Error("Password is required");
		}
		const job = new DecryptionJob(worker, fileName, password);
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

	return { progress, encryptBlob, decryptBlob, preview, setPreview };
}
