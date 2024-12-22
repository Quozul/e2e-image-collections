import { type ChangeEvent, useState } from "react";
import { useWorkerEncryption } from "./encryption/useWorkerEncryption.ts";
import { useList } from "./hooks/useList.ts";

export function App() {
	const [password, setPassword] = useState("");
	const { data: files, refresh } = useList();
	const { encryptBlob, progress, isReady, decryptBlob } = useWorkerEncryption(
		password,
		refresh,
	);

	const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
		setPassword(event.currentTarget.value);
	};

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
			<input type="password" onChange={handlePasswordChange} value={password} />
			<input type="file" multiple onChange={handleChange} disabled={!isReady} />
			<progress value={progress} />

			<ul>
				{files.map((file) => (
					<li key={file}>
						<button type="button" onClick={() => decryptBlob(file)}>
							{file}
						</button>
					</li>
				))}
			</ul>
		</>
	);
}
