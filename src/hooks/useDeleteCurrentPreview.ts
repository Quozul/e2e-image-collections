import { useWorkerContext } from "@/contexts/useWorkerContext.ts";
import { useState } from "react";

export function useDeleteCurrentPreview() {
	const worker = useWorkerContext();
	const [isLoading, setIsLoading] = useState(false);
	const isVisible = worker.preview !== null;
	const isDisabled = !isVisible || isLoading;

	const handleDelete = async () => {
		if (!worker.preview) {
			throw new Error("No preview selected");
		}
		setIsLoading(true);
		await fetch(
			`${import.meta.env.VITE_API_BASE_URL}/file/${worker.preview.name}`,
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
		isDisabled,
		isVisible,
	};
}
