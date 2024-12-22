import { type ChangeEvent, useEffect, useState } from "react";
import { BlobEncryption } from "./encryption/BlobEncryption.ts";
import { PasswordKey } from "./encryption/PasswordKey.ts";

export function App() {
	const [encryption, setEncryption] = useState<BlobEncryption | null>(null);

	useEffect(() => {
		PasswordKey.load("password").then((passwordKey) =>
			setEncryption(new BlobEncryption(passwordKey)),
		);
	}, []);

	const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const files = event.currentTarget.files;
		if (files !== null && encryption !== null) {
			for (const file of files) {
				try {
					console.log(`Original digest: ${await encryption.digestBlob(file)}`);

					const encryptedFile = await encryption.encryptBlob(file);

					const decryptedFile = await encryption.decryptBlob(encryptedFile);

					console.log(
						`Decrypted digest: ${await encryption.digestBlob(decryptedFile)}`,
					);
				} catch (error) {
					console.error(error);
				}
			}
		}
	};

	return encryption !== null && <input type="file" onChange={handleChange} />;
}
