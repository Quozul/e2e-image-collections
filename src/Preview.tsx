import type { FilePreview } from "./encryption/useWorkerEncryption.ts";
import { useBlob } from "./hooks/useBlob.ts";
import "@quozul/canvas-image";

type Props = {
	preview: FilePreview;
};

export function Preview({ preview }: Props) {
	const previewUrl = useBlob(preview?.blob ?? null);

	if (!previewUrl) {
		return null;
	}

	if (preview.type?.startsWith("image/")) {
		return (
			// @ts-ignore
			<canvas-image
				className="block h-full"
				src={previewUrl}
				alt={preview.decryptedName}
				onContextMenu={() => false}
			/>
		);
	}

	if (preview.type?.startsWith("video/")) {
		return (
			// biome-ignore lint/a11y/useMediaCaption: <explanation>
			<video src={previewUrl} controls className="w-full h-full">
				<source src={previewUrl} type={preview.type} />
			</video>
		);
	}

	return (
		<div className="p-2">
			<a
				className="underline text-blue-500"
				href={previewUrl}
				download={preview.decryptedName}
			>
				Download {preview.decryptedName}
			</a>
		</div>
	);
}
