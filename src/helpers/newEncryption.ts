/*
 * Documentations
 *
 * https://sec4dev.io/assets/uploads/slides/Tom-End-to-end-File-Encryption-in-the-Web-Browser-A-Case-Study.pdf
 * https://crypto.stackexchange.com/questions/81539/proper-way-of-encrypting-large-files-with-aes-256-gcm
 * https://stackoverflow.com/questions/59514734/encrypting-large-files-using-the-webcrypto-api
 * https://github.com/mozilla/send/blob/ade10e496c064d3b29191dd33b1066bf99607d74/app/ece.js#L188
 */

async function* chunked(array: Blob, padding: number, chunkSize: number) {
  for (let i = padding; i < array.size; i += chunkSize) {
    const start = i,
      end = i + chunkSize;
    const chunk = await array.slice(start, end).arrayBuffer();
    yield { chunk, start, end };
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

async function sendChunk(chunk: Uint8Array, start: number, end: number) {
  await fetch(`${import.meta.env.VITE_API_URL}/collection/stream`, {
    method: "post",
    headers: {
      "content-range": `bytes ${start}-${end}/*`,
      "content-type": "application/octet-stream",
    },
    body: chunk,
  });
}

export async function encryption(inputFile: File) {
  let iv = generateIv();

  await sendChunk(iv, 0, 16);

  for await (const { chunk, start, end } of chunked(inputFile, 0, sliceSize)) {
    const encryptedChunk = await crypto.subtle.encrypt({ name: algorithm, iv }, key, chunk);
    const bytes = new Uint8Array(encryptedChunk);

    await sendChunk(bytes, start, end);

    const nextIv = chunk.slice(chunk.byteLength - ivSize, chunk.byteLength);
    iv = new Uint8Array(nextIv);
  }
}

export async function decryption(inputFile: Blob) {
  const rawIv = inputFile.slice(0, ivSize);
  let iv = new Uint8Array(await rawIv.arrayBuffer());

  const file: number[] = [];

  for await (const { chunk, start, end } of chunked(inputFile, ivSize, sliceSize + ivSize)) {
    const decryptedChunk = await crypto.subtle.decrypt({ name: algorithm, iv }, key, chunk);
    const bytes = new Uint8Array(decryptedChunk);

    for (const byte of bytes) {
      file.push(byte);
    }

    iv = bytes.slice(bytes.length - ivSize, bytes.length);
  }

  return new Blob([new Uint8Array(file)]);
}
