import { AsyncArrayBuffer } from "./AsyncBlob.ts";
import { Encryption } from "./Encryption.ts";

export class StringEncryption extends Encryption {
	public async encryptString(input: string): Promise<string> {
		const encoder = new TextEncoder();
		const encodedText = encoder.encode(input);
		let bytes = new ArrayBuffer(0);

		const asyncArrayBuffer = new AsyncArrayBuffer(encodedText);
		for await (const encryptedArrayBuffer of this.encrypt(asyncArrayBuffer)) {
			bytes = this.mergeArrayBuffers(bytes, encryptedArrayBuffer);
		}

		return this.bytesToBase64Url(bytes);
	}

	public async decryptString(input: string): Promise<string> {
		const buffer = this.decodeBase64UrlToArrayBuffer(input);
		const decoder = new TextDecoder();
		let bytes = new ArrayBuffer(0);

		const asyncBlob = new AsyncArrayBuffer(buffer);
		for await (const decryptedArrayBuffer of this.decrypt(asyncBlob)) {
			bytes = this.mergeArrayBuffers(bytes, decryptedArrayBuffer);
		}

		return decoder.decode(bytes);
	}

	private async bytesToBase64Url(bytes: ArrayBuffer): Promise<string> {
		return await new Promise((resolve, reject) => {
			const reader = Object.assign(new FileReader(), {
				onload: () => {
					const result = String(reader.result) ?? "";

					resolve(
						result
							.substring(result.indexOf(",") + 1)
							.replace(/\+/g, "-")
							.replace(/\//g, "_")
							.replace(/=+$/, ""),
					);
				},
				onerror: () => reject(reader.error),
			});

			reader.readAsDataURL(new Blob([bytes]));
		});
	}

	private decodeBase64UrlToArrayBuffer(input: string): ArrayBuffer {
		let str = input;
		str = str.replace(/-/g, "+").replace(/_/g, "/");
		while (str.length % 4) {
			str += "=";
		}

		const binaryString = atob(str);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		return bytes.buffer;
	}
}
