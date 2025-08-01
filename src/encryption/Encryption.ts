import { AsyncSliceReader, type Slice } from "./AsyncBlob.ts";
import {
	ENCRYPTION_ALGORITHM,
	KEY_SALT_SIZE,
	PasswordKey,
} from "./PasswordKey.ts";

// Constants
export const IV_SIZE = 12; // 12 bytes is recommended for AES-GCM
export const CHUNK_SIZE = 16 * 1024 * 1024; // 16 MiB plaintext chunks
export const AUTH_TAG_SIZE = 16; // AES-GCM uses a 16-byte authentication tag

export class Encryption {
	/**
	 * Encrypts a stream of data.
	 * The output format is: [salt][iv_1][encrypted_chunk_1][iv_2][encrypted_chunk_2]...
	 *
	 * @param plaintext The data to encrypt (e.g., a File).
	 * @param password The password to use for encryption.
	 */
	public async *encrypt(
		plaintext: Slice,
		password: string,
	): AsyncGenerator<ArrayBuffer> {
		const salt = crypto.getRandomValues(new Uint8Array(KEY_SALT_SIZE));
		yield salt.buffer;

		const passwordKey = await PasswordKey.load(password, salt);

		for await (const chunk of this.chunked(plaintext, CHUNK_SIZE)) {
			const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));

			const encryptedChunk = await crypto.subtle.encrypt(
				{ name: ENCRYPTION_ALGORITHM, iv: iv },
				passwordKey.key,
				chunk,
			);

			yield iv.buffer;
			yield encryptedChunk;
		}
	}

	/**
	 * Decrypts a stream of data that was encrypted with the `encrypt` method.
	 *
	 * @param ciphertext The data to decrypt.
	 * @param password The password to use for decryption.
	 */
	public async *decrypt(
		ciphertext: Slice,
		password: string,
	): AsyncGenerator<ArrayBuffer> {
		const reader = new AsyncSliceReader(ciphertext);

		const salt = await reader.read(KEY_SALT_SIZE);
		if (!salt) {
			throw new Error("Invalid ciphertext: could not read salt.");
		}

		const passwordKey = await PasswordKey.load(password, new Uint8Array(salt));

		while (!reader.isDone()) {
			const iv = await reader.read(IV_SIZE);
			if (!iv) break; // Reached the end of the file

			const chunkToDecrypt = await reader.read(CHUNK_SIZE + AUTH_TAG_SIZE);
			if (!chunkToDecrypt) {
				throw new Error("Invalid ciphertext: partial chunk found.");
			}

			try {
				const decryptedChunk = await crypto.subtle.decrypt(
					{ name: ENCRYPTION_ALGORITHM, iv: new Uint8Array(iv) },
					passwordKey.key,
					chunkToDecrypt,
				);
				yield decryptedChunk;
			} catch (_err) {
				throw new Error(
					"Decryption failed. The data is corrupt or the password is wrong.",
				);
			}
		}
	}

	protected mergeArrayBuffers(
		buffer1: ArrayBuffer,
		buffer2: ArrayBuffer,
	): ArrayBuffer {
		const merged = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
		merged.set(new Uint8Array(buffer1), 0);
		merged.set(new Uint8Array(buffer2), buffer1.byteLength);
		return merged.buffer;
	}

	private async *chunked(
		blob: Slice,
		chunkSize: number,
	): AsyncGenerator<ArrayBuffer> {
		for (let i = 0; i < blob.size; i += chunkSize) {
			const end = Math.min(i + chunkSize, blob.size);
			yield await blob.slice(i, end);
		}
	}
}
