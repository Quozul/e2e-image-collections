import {
	WorkerContext,
	type WorkerContextType,
} from "@/contexts/WorkerContext.ts";
import { useWorkerEncryption } from "@/encryption/useWorkerEncryption.ts";
import { useList } from "@/hooks/useList.ts";
import { type PropsWithChildren, useState } from "react";

export function WorkerContextProvider({ children }: PropsWithChildren) {
	const { data, refresh } = useList();
	const [password, setPassword] = useState("");
	const { encryptBlob, decryptBlob, preview, setPreview } =
		useWorkerEncryption(refresh);

	const value: WorkerContextType = {
		setPassword,
		encryptBlob,
		decryptBlob,
		preview,
		setPreview,
		fileList: data,
		password,
		refresh,
	};

	return (
		<WorkerContext.Provider value={value}>{children}</WorkerContext.Provider>
	);
}
