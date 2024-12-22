import { useEffect, useState } from "react";

export function useBlob(blob: Blob | null): string | null {
	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		if (blob !== null) {
			const objectURL = URL.createObjectURL(blob);
			setUrl(objectURL);

			return () => {
				URL.revokeObjectURL(objectURL);
			};
		}

		setUrl(null);
	}, [blob]);

	return url;
}
