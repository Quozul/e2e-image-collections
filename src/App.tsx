import type { ChangeEvent } from "react";
import { useWorkerEncryption } from "./encryption/useWorkerEncryption.ts";

export function App() {
	const { encryptBlob, progress, isReady } = useWorkerEncryption("password");

	const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const files = event.currentTarget.files;
		if (!files || !files.length) {
			console.error("No files selected!");
		} else if (!isReady) {
			console.error("Not ready!");
		} else {
			for (const file of files) {
				await encryptBlob(file);
			}
		}
	};

	return (
		<>
			<input type="file" multiple onChange={handleChange} disabled={!isReady} />
			<progress value={progress} />
		</>
	);
}
