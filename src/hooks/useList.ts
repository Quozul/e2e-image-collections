import { useEffect, useMemo, useState } from "react";
import { usePasswordContext } from "@/contexts/usePasswordContext.ts";
import { StringEncryption } from "@/encryption/StringEncryption.ts";
import { useFetch } from "./useFetch.ts";

export type ListItem = {
	encryptedName: string;
	decryptedName: string | null;
};

export function useList() {
	const response = useFetch<string[]>(
		`${import.meta.env.VITE_API_BASE_URL}/file`,
		[],
	);
	const [data, setData] = useState<ListItem[]>([]);
	const { password } = usePasswordContext();
	const stringEncryption = useMemo(() => new StringEncryption(), []);

	useEffect(() => {
		if (stringEncryption) {
			Promise.all(
				response.data.map((encryptedName) =>
					stringEncryption
						.decryptString(encryptedName, password)
						.then((decryptedName) => {
							return { decryptedName, encryptedName };
						})
						.catch(() => ({ decryptedName: null, encryptedName })),
				),
			).then(setData);
		} else {
			setData(
				response.data.map((encryptedName) => ({
					decryptedName: null,
					encryptedName,
				})),
			);
		}
	}, [response.data, stringEncryption, password]);

	return { data, refresh: response.refresh };
}
