import * as fs from "fs/promises";
import * as crypto from "crypto";

/*
 * Documentations
 *
 * https://sec4dev.io/assets/uploads/slides/Tom-End-to-end-File-Encryption-in-the-Web-Browser-A-Case-Study.pdf
 * https://crypto.stackexchange.com/questions/81539/proper-way-of-encrypting-large-files-with-aes-256-gcm
 * https://stackoverflow.com/questions/59514734/encrypting-large-files-using-the-webcrypto-api
 * https://github.com/mozilla/send/blob/ade10e496c064d3b29191dd33b1066bf99607d74/app/ece.js#L188
 */

function* chunked<T>(array: ArrayBuffer, padding: number, chunkSize: number) {
  for (let i = padding; i < array.byteLength; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

// Constants
const sliceSize = 16_777_216; // 16 MiB
// const sliceSize = 1024; // 1 KiB
const ivSize = 16;
const algorithm = "AES-GCM";
const password = "password";

// Generate a key
const encoder = new TextEncoder();
const encodedPassword = encoder.encode(password);
const keyData = await crypto.subtle.digest({ name: "SHA-256" }, encodedPassword);
const key = await crypto.subtle.importKey("raw", keyData, { name: algorithm }, false, ["encrypt", "decrypt"]);

function generateIv(ivSize: number = 16) {
  const iv = new Uint8Array(ivSize);
  crypto.getRandomValues(iv);
  return iv;
}

async function encryption(inputFilePath: string, outputFilePath: string) {
  // Get a handle of the file
  const buffer = (await fs.readFile(inputFilePath)).buffer;

  // Generate a random IV
  let iv = generateIv();

  const file = await fs.open(outputFilePath, "a");
  await fs.writeFile(file, iv, "binary");

  // Encrypt the file slice by slice
  for (const chunk of chunked(buffer, 0, sliceSize)) {
    const encryptedChunk = await crypto.subtle.encrypt({ name: algorithm, iv }, key, chunk);
    const bytes = new Uint8Array(encryptedChunk);

    await fs.appendFile(file, bytes, "binary");

    const nextIv = chunk.slice(chunk.byteLength - ivSize, chunk.byteLength);
    iv = new Uint8Array(nextIv);
  }

  await file.close();
}

async function decryption(inputFilePath: string, outputFilePath: string) {
  const buffer = (await fs.readFile(inputFilePath)).buffer;

  const rawIv = buffer.slice(0, ivSize);
  let iv = new Uint8Array(rawIv);

  const file = await fs.open(outputFilePath, "a");

  for (const chunk of chunked(buffer, ivSize, sliceSize + ivSize)) {
    const decryptedChunk = await crypto.subtle.decrypt({ name: algorithm, iv }, key, chunk);
    const bytes = new Uint8Array(decryptedChunk);

    await fs.appendFile(file, bytes, "binary");

    iv = bytes.slice(bytes.length - ivSize, bytes.length);
  }

  await file.close();
}

const originalFilePath = "scripts/raw.jpg";
const inputFilePath = "scripts/encrypted.jpg";
const outputFilePath = "scripts/decrypted.jpg";

try {
  await fs.rm(inputFilePath);
} catch (e) {}

try {
  await fs.rm(outputFilePath);
} catch (e) {}

console.log("\n\n==========\nENCRYPTION\n==========\n\n");
await encryption(originalFilePath, inputFilePath);
console.log("\n\n==========\nDECRYPTION\n==========\n\n");
await decryption(inputFilePath, outputFilePath);
