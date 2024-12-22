/*
 * Documentations
 *
 * https://sec4dev.io/assets/uploads/slides/Tom-End-to-end-File-Encryption-in-the-Web-Browser-A-Case-Study.pdf
 * https://crypto.stackexchange.com/questions/81539/proper-way-of-encrypting-large-files-with-aes-256-gcm
 * https://stackoverflow.com/questions/59514734/encrypting-large-files-using-the-webcrypto-api
 * https://github.com/mozilla/send/blob/ade10e496c064d3b29191dd33b1066bf99607d74/app/ece.js#L188
 */

// Constants
const SLICE_SIZE = 16_777_216; // 16 MiB
const IV_SIZE = 16;
const ALGORITHM = "AES-GCM";

class Encryption {
	protected constructor(private key: CryptoKey) {}

	protected static async load(password: string): Promise<Encryption> {
		// Generate a key
		const encoder = new TextEncoder();
		const encodedPassword = encoder.encode(password);
		const keyData = await crypto.subtle.digest(
			{ name: "SHA-256" },
			encodedPassword,
		);
		const key = await crypto.subtle.importKey(
			"raw",
			keyData,
			{ name: ALGORITHM },
			false,
			["encrypt", "decrypt"],
		);

		return new Encryption(key);
	}

	protected async *encrypt(input: Blob): AsyncGenerator<ArrayBuffer> {
		// Generate a random IV
		let iv = this.generateIv(IV_SIZE);
		yield iv.buffer;

		// Encrypt the file slice by slice
		for await (const chunk of this.chunked(input, 0, SLICE_SIZE)) {
			const encryptedChunk = await crypto.subtle.encrypt(
				{ name: ALGORITHM, iv },
				this.key,
				chunk,
			);
			yield encryptedChunk;

			const nextIv = chunk.slice(chunk.byteLength - IV_SIZE, chunk.byteLength);
			iv = new Uint8Array(nextIv);
		}
	}

	protected async *decrypt(input: Blob): AsyncGenerator<ArrayBuffer> {
		const rawIv = input.slice(0, IV_SIZE);
		let iv = new Uint8Array(await rawIv.arrayBuffer());

		for await (const chunk of this.chunked(
			input,
			IV_SIZE,
			SLICE_SIZE + IV_SIZE,
		)) {
			const decryptedChunk = await crypto.subtle.decrypt(
				{ name: ALGORITHM, iv },
				this.key,
				chunk,
			);
			yield decryptedChunk;

			const nextIv = decryptedChunk.slice(
				decryptedChunk.byteLength - IV_SIZE,
				decryptedChunk.byteLength,
			);
			iv = new Uint8Array(nextIv);
		}
	}

	protected async digest(input: Blob): Promise<string> {
		let hash = new ArrayBuffer(0);

		for await (const chunk of this.chunked(input, 0, SLICE_SIZE)) {
			hash = await crypto.subtle.digest(
				"SHA-256",
				this.mergeArrayBuffers(hash, chunk),
			);
		}

		return this.arrayBufferToHex(hash);
	}

	private generateIv(ivSize: number = IV_SIZE) {
		const iv = new Uint8Array(ivSize);
		crypto.getRandomValues(iv);
		return iv;
	}

	private async *chunked(
		blob: Blob,
		padding: number,
		chunkSize: number,
	): AsyncGenerator<ArrayBuffer> {
		for (let i = padding; i < blob.size; i += chunkSize) {
			yield await blob.slice(i, i + chunkSize).arrayBuffer();
		}
	}

	private mergeArrayBuffers(
		buffer1: ArrayBuffer,
		buffer2: ArrayBuffer,
	): ArrayBuffer {
		const merged = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
		merged.set(new Uint8Array(buffer1), 0);
		merged.set(new Uint8Array(buffer2), buffer1.byteLength);
		return merged.buffer;
	}

	private arrayBufferToHex(buffer: ArrayBuffer): string {
		return Array.from(new Uint8Array(buffer))
			.map((x) => x.toString(16).padStart(2, "0"))
			.join("");
	}
}

export class BlobEncryption extends Encryption {
	static async load(password: string): Promise<BlobEncryption> {
		// Generate a key
		const encoder = new TextEncoder();
		const encodedPassword = encoder.encode(password);
		const keyData = await crypto.subtle.digest(
			{ name: "SHA-256" },
			encodedPassword,
		);
		const key = await crypto.subtle.importKey(
			"raw",
			keyData,
			{ name: ALGORITHM },
			false,
			["encrypt", "decrypt"],
		);

		return new BlobEncryption(key);
	}

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
