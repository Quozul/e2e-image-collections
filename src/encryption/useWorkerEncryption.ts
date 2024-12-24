import { usePasswordContext } from "@/contexts/usePasswordContext.ts";
import mime from "mime";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DecryptionJob } from "./worker/DecryptionJob.ts";
import { EncryptionJob } from "./worker/EncryptionJob.ts";
import ApiEncryptionWorker from "./worker/EncryptionWorker.ts?worker";

export type FilePreview = {
	blob: Blob;
	decryptedName: string;
	encryptedName: string;
	type: string | null;
};

export function useWorkerEncryption(refresh: () => void) {
	const [preview, setPreview] = useState<FilePreview | null>(null);
	const worker = useMemo(() => new ApiEncryptionWorker(), []);
	const { requestNewPassword } = usePasswordContext();

	const encryptBlob = async (file: File, password: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			const job = new EncryptionJob(worker, file);
			job.addEventListener(
				"onerror",
				() => {
					requestNewPassword((newPassword) => encryptBlob(file, newPassword));
					reject();
				},
				{ once: true },
			);
			job.addEventListener(
				"oncomplete",
				() => {
					refresh();
					toast(`File "${file.name}" has been uploaded.`);
					resolve();
				},
				{ once: true },
			);
			job.startJob(password);
		});
	};

	const decryptBlob = async (
		encryptedFileName: string,
		password: string,
	): Promise<void> => {
		return new Promise((resolve, reject) => {
			const job = new DecryptionJob(worker, encryptedFileName);
			job.addEventListener(
				"onerror",
				() => {
					requestNewPassword((newPassword) =>
						decryptBlob(encryptedFileName, newPassword),
					);
					reject();
				},
				{ once: true },
			);
			job.addEventListener(
				"oncomplete",
				(event) => {
					const preview: FilePreview = {
						type: mime.getType(event.fileName),
						blob: event.blob,
						encryptedName: encryptedFileName,
						decryptedName: event.fileName,
					};
					setPreview(preview);
					resolve();
				},
				{ once: true },
			);
			job.startJob(password);
		});
	};

	return { encryptBlob, decryptBlob, preview, setPreview };
}
