import { AsyncBlob } from "./AsyncBlob.ts";
import { Encryption, SLICE_SIZE } from "./Encryption.ts";
import { NetworkBlob } from "./NetworkBlob.ts";

export class ProgressEncryption extends Encryption {
	public async *encryptFile(
		input: Blob,
		fileName: string,
	): AsyncGenerator<number> {
		const asyncBlob = new AsyncBlob(input);

		let chunk = 0;
		let writtenBytes = 0;
		const totalChunks = this.chunkCount(asyncBlob.size);

		for await (const encryptedArrayBuffer of this.encrypt(asyncBlob)) {
			const rangeStart = writtenBytes;
			const rangeEnd = rangeStart + encryptedArrayBuffer.byteLength;
			await fetch(`${import.meta.env.VITE_API_BASE_URL}/file/${fileName}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/octet-stream",
					"Content-Range": `bytes ${rangeStart}-${rangeEnd}/${input.size}`,
				},
				body: encryptedArrayBuffer,
				mode: "cors",
			});

			writtenBytes += encryptedArrayBuffer.byteLength;
			yield chunk++ / totalChunks;
		}
	}

	public async *decryptBlob(fileName: string): AsyncGenerator<number, Blob> {
		const networkBlob = await NetworkBlob.load(
			`${import.meta.env.VITE_API_BASE_URL}/file/${fileName}`,
		);
		const totalSize = networkBlob.size;
		let chunk = 0;
		const totalChunks = this.chunkCount(totalSize);

		const blobParts: BlobPart[] = [];

		for await (const decryptedArrayBuffer of this.decrypt(networkBlob)) {
			blobParts.push(decryptedArrayBuffer);
			yield ++chunk / totalChunks;
		}

		return new Blob(blobParts);
	}

	private chunkCount(size: number): number {
		return Math.ceil(size / SLICE_SIZE);
	}
}
