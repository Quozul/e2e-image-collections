import safeMime from "~/helpers/safeMime";

export async function getKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const encodedPassword = encoder.encode(password);

  const keyData = await crypto.subtle.digest({ name: "SHA-256" }, encodedPassword);

  return await crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export function extractBytesFromString(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function decodeBase64UrlToArrayBuffer(str: string): ArrayBuffer {
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

async function bytesToBase64Url(bytes: ArrayBuffer): Promise<string> {
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

// Encryption

async function encrypt(key: CryptoKey, data: BufferSource, iv: Uint8Array): Promise<ArrayBuffer> {
  return await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
}

export async function encryptString(key: CryptoKey, iv: Uint8Array, payload: string, fileName: string) {
  const encryptedContent = await encrypt(key, extractBytesFromString(payload), iv);
  return new File([encryptedContent], fileName);
}

export async function encryptFile(key: CryptoKey, iv: Uint8Array, file: File) {
  const buffer = await file.arrayBuffer();
  const encryptedContent = await encrypt(key, buffer, iv);

  const encryptedName = encodeURIComponent(await bytesToBase64Url(await encrypt(key, extractBytesFromString(file.name).buffer, iv)));

  return new File([encryptedContent], encryptedName, {
    lastModified: file.lastModified,
  });
}

// Decryption

async function decrypt(key: CryptoKey, data: BufferSource, iv: Uint8Array): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
}

async function decryptString(cryptoKey: CryptoKey, iv: string, payload: string): Promise<string> {
  const decryptedBase64Name = await decrypt(cryptoKey, decodeBase64UrlToArrayBuffer(payload), extractBytesFromString(atob(iv)));

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBase64Name);
}

async function fetchAndDecrypt(cryptoKey: CryptoKey, iv: string, collectionName: string, imageName: string): Promise<ArrayBuffer> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/collection/${collectionName}/image/${imageName}`);
  const buffer = await response.arrayBuffer();

  return await decrypt(cryptoKey, buffer, extractBytesFromString(atob(iv)));
}

export async function fetchAndDecryptFile(cryptoKey: CryptoKey, iv: string, collectionName: string, imageName: string): Promise<File> {
  const decrypted = await fetchAndDecrypt(cryptoKey, iv, collectionName, imageName);

  const name = await decryptString(cryptoKey, iv, imageName);
  const type = safeMime(name) ?? "";

  return new File([decrypted], name, { type });
}

export async function fetchAndDecryptString(cryptoKey: CryptoKey, iv: string, collectionName: string, imageName: string): Promise<string> {
  try {
    const decrypted = await fetchAndDecrypt(cryptoKey, iv, collectionName, imageName);

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (e) {
    console.error(e);
    return "";
  }
}
