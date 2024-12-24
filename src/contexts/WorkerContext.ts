import type { FilePreview } from "@/encryption/useWorkerEncryption.ts";
import type { ListItem } from "@/hooks/useList.ts";
import { createContext } from "react";

export type WorkerContextType = {
	setPreview: (preview: FilePreview | null) => void;
	preview: FilePreview | null;
	fileList: ListItem[];
	encryptBlob: (blob: File, password: string) => Promise<void>;
	decryptBlob: (fileName: string, password: string) => Promise<void>;
	refresh: () => void;
};

const Noop = () => void 0;
const NoopPromise = () => Promise.resolve();

const defaultValue: WorkerContextType = {
	setPreview: Noop,
	preview: null,
	fileList: [],
	encryptBlob: NoopPromise,
	decryptBlob: NoopPromise,
	refresh: Noop,
};

export const WorkerContext = createContext(defaultValue);
