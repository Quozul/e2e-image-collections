export const PBKDF2_ITERATIONS = 250_000;
export const KEY_SALT_SIZE = 16; // 16 bytes / 128 bits
export const ENCRYPTION_ALGORITHM = "AES-GCM";

export class PasswordKey {
	protected constructor(private _key: CryptoKey) {}

	/**
	 * Derives a CryptoKey from a password string using PBKDF2.
	 * @param password The user-provided password.
	 * @param salt A cryptographically random salt. Must be unique for each encryption.
	 * @returns A PasswordKey instance containing the derived key.
	 */
	static async load(password: string, salt: Uint8Array): Promise<PasswordKey> {
		const encoder = new TextEncoder();
		const encodedPassword = encoder.encode(password);

		// Import the password as a base key for PBKDF2.
		const baseKey = await crypto.subtle.importKey(
			"raw",
			encodedPassword,
			{ name: "PBKDF2" },
			false,
			["deriveKey"],
		);

		// Derive the actual encryption key.
		const derivedKey = await crypto.subtle.deriveKey(
			{
				name: "PBKDF2",
				salt: salt,
				iterations: PBKDF2_ITERATIONS,
				hash: "SHA-256",
			},
			baseKey,
			{ name: ENCRYPTION_ALGORITHM, length: 256 }, // Key for AES-GCM
			false, // not extractable
			["encrypt", "decrypt"],
		);

		return new PasswordKey(derivedKey);
	}

	get key(): CryptoKey {
		return this._key;
	}
}
