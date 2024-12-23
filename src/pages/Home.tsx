import { Preview } from "@/Preview.tsx";

import { useWorkerContext } from "@/contexts/useWorkerContext.ts";

export default function Home() {
	const worker = useWorkerContext();

	return (
		<div className="grow overflow-hidden">
			{worker.preview ? (
				<Preview preview={worker.preview} />
			) : (
				<div className="p-2">No file selected</div>
			)}
		</div>
	);
}
