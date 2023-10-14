export function download(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function getKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const encodedPassword = encoder.encode(password);

  const keyData = await crypto.subtle.digest(
    { name: "SHA-256" },
    encodedPassword,
  );

  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export function extractBytesFromString(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

export function decodeBase64UrlToArrayBuffer(str: string): ArrayBuffer {
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

export async function bytesToBase64Url(bytes: ArrayBuffer): Promise<string> {
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

export async function decrypt(
  key: CryptoKey,
  data: BufferSource,
  iv: Uint8Array,
): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
}

export async function encrypt(
  key: CryptoKey,
  data: BufferSource,
  iv: Uint8Array,
): Promise<ArrayBuffer> {
  return await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
}

export async function encryptFile(key: CryptoKey, iv: Uint8Array, file: File) {
  const buffer = await file.arrayBuffer();
  const encryptedName = encodeURIComponent(
    await bytesToBase64Url(
      await encrypt(key, extractBytesFromString(file.name).buffer, iv),
    ),
  );
  const encryptedContent = await encrypt(key, buffer, iv);
  return new File([encryptedContent], encryptedName, {
    type: file.type,
    lastModified: file.lastModified,
  });
}

export async function decryptFileName(
  cryptoKey: CryptoKey,
  iv: string,
  name: string,
): Promise<string> {
  const decryptedBase64Name = await decrypt(
    cryptoKey,
    decodeBase64UrlToArrayBuffer(name),
    extractBytesFromString(iv),
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBase64Name);
}

export async function fetchAndDecryptImage(
  cryptoKey: CryptoKey,
  iv: string,
  collectionName: string,
  imageName: string,
) {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_URL
    }/collection/${collectionName}/image/${imageName}`,
  );
  const buffer = await response.arrayBuffer();

  const decrypted = await decrypt(
    cryptoKey,
    buffer,
    extractBytesFromString(iv),
  );

  const name = await decryptFileName(cryptoKey, iv, imageName);

  return new File([decrypted], name);
}
