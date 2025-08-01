import mime from "mime";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePasswordContext } from "@/contexts/usePasswordContext.ts";
import { PreviewStatus } from "@/contexts/WorkerContext.ts";
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
	const [previewStatus, setPreviewStatus] = useState<PreviewStatus>(
		PreviewStatus.None,
	);
	const [decryptProgress, setDecryptProgress] = useState<number>(0);
	const worker = useMemo(() => new ApiEncryptionWorker(), []);
	const { setIsPasswordModalOpen } = usePasswordContext();

	const encryptBlob = useCallback(
		(file: File, password: string): EncryptionJob => {
			const job = new EncryptionJob(worker, file);
			job.addEventListener(
				"onerror",
				() => {
					toast(`Could not encrypt "${file.name}".`);
				},
				{ once: true },
			);
			job.addEventListener(
				"oncomplete",
				() => {
					refresh();
					toast(`"${file.name}" has been uploaded.`);
				},
				{ once: true },
			);
			job.startJob(password);
			return job;
		},
		[worker, refresh],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const decryptBlob = useCallback(
		(encryptedFileName: string, password: string): DecryptionJob => {
			const job = new DecryptionJob(worker, encryptedFileName);
			setPreviewStatus(PreviewStatus.Loading);
			setPreview(null);
			setDecryptProgress(0);
			job.addEventListener(
				"onerror",
				() => {
					setIsPasswordModalOpen(true);
					setPreviewStatus(PreviewStatus.Encrypted);
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
					setPreviewStatus(PreviewStatus.Available);
				},
				{ once: true },
			);
			job.addEventListener("onprogress", (event) => {
				setDecryptProgress(event.progress);
			});
			job.startJob(password);
			return job;
		},
		[worker],
	);

	return {
		encryptBlob,
		decryptBlob,
		preview,
		setPreview,
		previewStatus,
		decryptProgress,
	};
}
