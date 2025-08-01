import { useEffect, useState } from "react";
import { usePasswordContext } from "@/contexts/usePasswordContext.ts";
import { PasswordKey } from "@/encryption/PasswordKey.ts";
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
	const stringEncryption = useStringEncryption();

	useEffect(() => {
		if (stringEncryption) {
			Promise.all(
				response.data.map((encryptedName) =>
					stringEncryption
						.decryptString(encryptedName)
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
	}, [response.data, stringEncryption]);

	return { data, refresh: response.refresh };
}

export function useStringEncryption() {
	const { password } = usePasswordContext();
	const [stringEncryption, setStringEncryption] =
		useState<StringEncryption | null>(null);

	useEffect(() => {
		PasswordKey.load(password).then((key) =>
			setStringEncryption(new StringEncryption(key)),
		);
	}, [password]);

	return stringEncryption;
}
