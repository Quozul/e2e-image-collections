import { useFetch } from "./useFetch.ts";

export function useList() {
	return useFetch<string[]>(`${import.meta.env.VITE_API_BASE_URL}/file`, []);
}
