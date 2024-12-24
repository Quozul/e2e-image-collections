import type { FilePreview } from "@/encryption/useWorkerEncryption.ts";
import type { DecryptionJob } from "@/encryption/worker/DecryptionJob.ts";
import type { EncryptionJob } from "@/encryption/worker/EncryptionJob.ts";
import type { ListItem } from "@/hooks/useList.ts";
import { createContext } from "react";

export type WorkerContextType = {
	setPreview: (preview: FilePreview | null) => void;
	preview: FilePreview | null;
	fileList: ListItem[];
	encryptBlob: (blob: File, password: string) => EncryptionJob;
	decryptBlob: (fileName: string, password: string) => DecryptionJob;
	refresh: () => void;
};

export const WorkerContext = createContext<WorkerContextType | null>(null);
