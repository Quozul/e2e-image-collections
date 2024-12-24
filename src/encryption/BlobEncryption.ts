import { AsyncArrayBuffer, AsyncBlob } from "./AsyncBlob.ts";
import { Encryption } from "./Encryption.ts";

export class StringEncryption extends Encryption {
	public async encryptString(input: string): Promise<string> {
		const blobParts: BlobPart[] = [];
		const encoder = new TextEncoder();
		const encodedText = encoder.encode(input);

		const asyncBlob = new AsyncArrayBuffer(encodedText.buffer);
		for await (const encryptedArrayBuffer of this.encrypt(asyncBlob)) {
			blobParts.push(encryptedArrayBuffer);
		}

		return new Blob(blobParts);
	}

	public async decryptBlob(input: Blob): Promise<Blob> {
		const blobParts: BlobPart[] = [];

		const asyncBlob = new AsyncBlob(input);
		for await (const decryptedArrayBuffer of this.decrypt(asyncBlob)) {
			blobParts.push(decryptedArrayBuffer);
		}

		return new Blob(blobParts);
	}

	public async digestBlob(input: Blob): Promise<string> {
		const asyncBlob = new AsyncBlob(input);
		return this.digest(asyncBlob);
	}
}
