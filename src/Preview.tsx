import type { FilePreview } from "./encryption/useWorkerEncryption.ts";
import { useBlob } from "./hooks/useBlob.ts";

type Props = {
	preview: FilePreview;
};

export function Preview({ preview }: Props) {
	const previewUrl = useBlob(preview?.blob ?? null);

	if (!previewUrl) {
		return null;
	}

	if (preview.type?.startsWith("image/")) {
		return <img src={previewUrl} alt={preview.name} />;
	}

	if (preview.type?.startsWith("video/")) {
		return (
			// biome-ignore lint/a11y/useMediaCaption: <explanation>
			<video src={previewUrl} controls>
				<source src={previewUrl} type={preview.type} />
			</video>
		);
	}

	return (
		<a href={previewUrl} download={preview.name}>
			Download {preview.name}
		</a>
	);
}
