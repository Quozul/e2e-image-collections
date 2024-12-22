import { AsyncBlob } from "./AsyncBlob.ts";
import { Encryption } from "./Encryption.ts";

export class BlobEncryption extends Encryption {
	public async encryptBlob(input: Blob): Promise<Blob> {
		const blobParts: BlobPart[] = [];

		const asyncBlob = new AsyncBlob(input);
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
