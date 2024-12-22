import { type ChangeEvent, useState } from "react";
import { Preview } from "./Preview.tsx";
import { useWorkerEncryption } from "./encryption/useWorkerEncryption.ts";
import { useList } from "./hooks/useList.ts";

export function App() {
	const [password, setPassword] = useState("password");
	const { data: files, refresh } = useList();
	const { encryptBlob, progress, isReady, decryptBlob, preview, setPreview } =
		useWorkerEncryption(password, refresh);

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

	const handleDelete = async () => {
		if (!preview) {
			throw new Error("No preview selected");
		}
		await fetch(`${import.meta.env.VITE_API_BASE_URL}/file/${preview.name}`, {
			method: "DELETE",
			mode: "cors",
		});
		refresh();
		setPreview(null);
	};

	return (
		<div className="flex flex-col gap-2 h-screen max-h-screen w-screen p-2">
			<div className="flex gap-2">
				<input
					type="password"
					className="border focus-visible:outline-none"
					onChange={handlePasswordChange}
					value={password}
				/>
				<input
					type="file"
					multiple
					onChange={handleChange}
					disabled={!isReady}
				/>
				<progress value={progress} />
				<button
					disabled={preview === null}
					type="button"
					onClick={handleDelete}
				>
					Delete selected
				</button>
			</div>

			<ol className="h-20 overflow-y-auto list-decimal">
				{files.sort().map((file) => (
					<li key={file} className="">
						<button type="button" onClick={() => decryptBlob(file)}>
							{file}
						</button>
					</li>
				))}
			</ol>

			{preview && <Preview preview={preview} />}
		</div>
	);
}
