import { readdir, readFile, writeFile } from "fs/promises";
import * as crypto from "crypto";

async function getKey(password: string): Promise<CryptoKey> {
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

async function decrypt(
  key: CryptoKey,
  data: BufferSource,
  iv: Uint8Array,
): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
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

function extractBytesFromString(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

async function decryptFileName(
  cryptoKey: CryptoKey,
  iv: Uint8Array,
  name: string,
): Promise<string> {
  const decryptedBase64Name = await decrypt(
    cryptoKey,
    decodeBase64UrlToArrayBuffer(name),
    iv,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBase64Name);
}

async function hashString(str: string) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const iv = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(str + "salt"),
  );
  return decoder.decode(iv);
}

const collectionName = "";
const collectionPath = `collections/${collectionName}`;
const password = "";
const output = `decrypted/${collectionName}`;
const cryptoKey = await getKey(password);

const iv = extractBytesFromString(await hashString(collectionName));
console.log(iv);

for (const dirEntry of await readdir(collectionPath)) {
  if (!dirEntry.startsWith(".")) {
    const file = await readFile(`${collectionPath}/${dirEntry}`);
    const content = await decrypt(cryptoKey, file, iv);
    const name = await decryptFileName(cryptoKey, iv, dirEntry);
    await writeFile(`${output}/${name}`, Buffer.from(content));
    console.log(`Written ${name}`);
  }
}
