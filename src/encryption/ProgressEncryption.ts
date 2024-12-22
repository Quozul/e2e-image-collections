import { Encryption, SLICE_SIZE } from "./Encryption.ts";

export class ProgressEncryption extends Encryption {
	public async *encryptFile(input: File): AsyncGenerator<number> {
		let chunk = 0;
		let writtenBytes = 0;
		const totalChunks = this.chunkCount(input, SLICE_SIZE);

		for await (const encryptedArrayBuffer of this.encrypt(input)) {
			const rangeStart = writtenBytes;
			const rangeEnd = rangeStart + encryptedArrayBuffer.byteLength;
			await fetch(`http://localhost:3000/upload/${input.name}`, {
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

	public async *decryptBlob(input: Blob): AsyncGenerator<number, Blob> {
		let chunk = 0;
		const totalChunks = this.chunkCount(input, SLICE_SIZE);
		const blobParts: BlobPart[] = [];

		for await (const decryptedArrayBuffer of this.decrypt(input)) {
			blobParts.push(decryptedArrayBuffer);
			yield chunk++ / totalChunks;
		}

		return new Blob(blobParts);
	}
}
