import { Encryption, SLICE_SIZE } from "./Encryption.ts";

export class ProgressEncryption extends Encryption {
	public async *encryptBlob(input: Blob): AsyncGenerator<number, Blob> {
		let chunk = 0;
		const totalChunks = this.chunkCount(input, SLICE_SIZE);
		const blobParts: BlobPart[] = [];

		for await (const encryptedArrayBuffer of this.encrypt(input)) {
			blobParts.push(encryptedArrayBuffer);
			yield chunk++ / totalChunks;
		}

		return new Blob(blobParts);
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
