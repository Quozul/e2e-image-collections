import { Encryption } from "./Encryption.ts";

export class BlobEncryption extends Encryption {
	public async encryptBlob(input: Blob): Promise<Blob> {
		const blobParts: BlobPart[] = [];

		for await (const encryptedArrayBuffer of this.encrypt(input)) {
			blobParts.push(encryptedArrayBuffer);
		}

		return new Blob(blobParts);
	}

	public async decryptBlob(input: Blob): Promise<Blob> {
		const blobParts: BlobPart[] = [];

		for await (const decryptedArrayBuffer of this.decrypt(input)) {
			blobParts.push(decryptedArrayBuffer);
		}

		return new Blob(blobParts);
	}

	public async digestBlob(input: Blob): Promise<string> {
		return this.digest(input);
	}
}
