import type { PropsWithChildren } from "react";
import {
	WorkerContext,
	type WorkerContextType,
} from "@/contexts/WorkerContext.ts";
import { useWorkerEncryption } from "@/encryption/useWorkerEncryption.ts";
import { useList } from "@/hooks/useList.ts";

export function WorkerContextProvider({ children }: PropsWithChildren) {
	const { data, refresh } = useList();

	const worker = useWorkerEncryption(refresh);

	const value: WorkerContextType = {
		...worker,
		fileList: data,
		refresh,
	};

	return (
		<WorkerContext.Provider value={value}>{children}</WorkerContext.Provider>
	);
}
