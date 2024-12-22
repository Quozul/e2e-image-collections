import { ALGORITHM } from "./Encryption.ts";

export class PasswordKey {
	protected constructor(private _key: CryptoKey) {}

	static async load(password: string): Promise<PasswordKey> {
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

		return new PasswordKey(key);
	}

	get key(): CryptoKey {
		return this._key;
	}
}
