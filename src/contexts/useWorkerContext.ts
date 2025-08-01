import { useContext } from "react";
import {
	WorkerContext,
	type WorkerContextType,
} from "@/contexts/WorkerContext.ts";

export function useWorkerContext(): WorkerContextType {
	const context = useContext(WorkerContext);
	if (context === null) {
		throw new Error("useWorkerContext must be used within useWorkerContext");
	}
	return context;
}
