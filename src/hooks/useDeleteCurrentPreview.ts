import { useState } from "react";
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";

export function useDeleteCurrentPreview() {
	const worker = useWorkerContext();
	const [isLoading, setIsLoading] = useState(false);

	const handleDelete = async () => {
		if (!worker.preview) {
			throw new Error("No preview selected");
		}
		setIsLoading(true);
		await fetch(
			`${import.meta.env.VITE_API_BASE_URL}/file/${worker.preview.encryptedName}`,
			{
				method: "DELETE",
				mode: "cors",
			},
		)
			.then(() => {
				worker.refresh();
				worker.setPreview(null);
			})
			.finally(() => setIsLoading(false));
	};

	return {
		handleDelete,
		isLoading,
		decryptedName: worker.preview?.decryptedName,
	};
}
