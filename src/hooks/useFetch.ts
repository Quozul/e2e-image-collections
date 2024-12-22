import { useCallback, useEffect, useState } from "react";

type UseFetch<T> = {
	error: Error | null;
	data: T;
	isLoading: boolean;
	refresh: () => void;
};

export function useFetch<T>(url: string, defaultValue: T): UseFetch<T> {
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [data, setData] = useState<T>(defaultValue);

	const fetchData = useCallback((): AbortController => {
		const abortController = new AbortController();
		setIsLoading(true);
		fetch(url, { signal: abortController.signal })
			.then((res) => {
				setError(null);
				return res.json();
			})
			.then(setData)
			.catch(setError)
			.finally(() => setIsLoading(false));
		return abortController;
	}, [url]);

	useEffect(() => {
		const abortController = fetchData();
		return () => {
			abortController.abort();
		};
	}, [fetchData]);

	return { error, refresh: fetchData, data, isLoading };
}
