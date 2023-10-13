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

export async function getKey(password: string) {
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

export function extractBytesFromString(str: string) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

export async function decrypt(
  key: CryptoKey,
  data: BufferSource,
  iv: Uint8Array,
) {
  const result = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );

  return new Blob([result]);
}

export async function encrypt(
  key: CryptoKey,
  data: BufferSource,
  iv: Uint8Array,
) {
  return await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
}
