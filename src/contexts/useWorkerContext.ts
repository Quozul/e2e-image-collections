import { WorkerContext } from "@/contexts/WorkerContext.ts";
import { useContext } from "react";

export function useWorkerContext() {
	return useContext(WorkerContext);
}
