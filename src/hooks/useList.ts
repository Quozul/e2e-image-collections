import { useFetch } from "./useFetch.ts";

export function useList() {
	return useFetch<string[]>("http://localhost:3000/files", []);
}
