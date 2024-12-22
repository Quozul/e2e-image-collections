import type { FilePreview } from "./encryption/useWorkerEncryption.ts";
import { useBlob } from "./hooks/useBlob.ts";
import "@quozul/canvas-image/src/main.ts";

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
			<div className="grow overflow-hidden">
				<canvas-image
					className="block h-full"
					src={previewUrl}
					alt={preview.name}
				/>
			</div>
		);
	}

	if (preview.type?.startsWith("video/")) {
		return (
			<div className="grow overflow-hidden">
				{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
				<video src={previewUrl} controls className="w-full h-full">
					<source src={previewUrl} type={preview.type} />
				</video>
			</div>
		);
	}

	return (
		<a href={previewUrl} download={preview.name}>
			Download {preview.name}
		</a>
	);
}
