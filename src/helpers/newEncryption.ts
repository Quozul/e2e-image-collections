/*
 * Documentations
 *
 * https://sec4dev.io/assets/uploads/slides/Tom-End-to-end-File-Encryption-in-the-Web-Browser-A-Case-Study.pdf
 * https://crypto.stackexchange.com/questions/81539/proper-way-of-encrypting-large-files-with-aes-256-gcm
 * https://stackoverflow.com/questions/59514734/encrypting-large-files-using-the-webcrypto-api
 * https://github.com/mozilla/send/blob/ade10e496c064d3b29191dd33b1066bf99607d74/app/ece.js#L188
 */

export class Encryption {
  private constructor(private key: CryptoKey) {}

  static async load(password: string): Promise<Encryption> {
    const encoder = new TextEncoder();
    const encodedPassword = encoder.encode(password);
    const keyData = await crypto.subtle.digest({ name: "SHA-256" }, encodedPassword);
    const key = await crypto.subtle.importKey("raw", keyData, { name: ALGORITHM }, false, ["encrypt", "decrypt"]);

    return new Encryption(key);
  }

  async encrypt(input: Blob): Promise<Blob> {
    const blobParts: BlobPart[] = [];

    // Generate a random 16B initialization vector to encrypt the first chunk
    let iv = generateIv(IV_SIZE);
    blobParts.push(iv.buffer);

    for await (const chunk of chunked(input, 0, SLICE_SIZE)) {
      blobParts.push(await crypto.subtle.encrypt({ name: ALGORITHM, iv }, this.key, chunk));

      // Re-use the last unencrypted 16B as the IV for the next chunk
      const nextIv = chunk.slice(chunk.byteLength - IV_SIZE, chunk.byteLength);
      iv = new Uint8Array(nextIv);
    }

    return new Blob(blobParts);
  }

  async decrypt(input: Blob): Promise<Blob> {
    const blobParts: BlobPart[] = [];
    const rawIv = input.slice(0, IV_SIZE);
    let iv = new Uint8Array(await rawIv.arrayBuffer());

    for await (const chunk of chunked(input, IV_SIZE, SLICE_SIZE + IV_SIZE)) {
      const decryptedChunk = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, this.key, chunk);
      blobParts.push(decryptedChunk);

      const nextIv = decryptedChunk.slice(decryptedChunk.byteLength - IV_SIZE, decryptedChunk.byteLength);
      iv = new Uint8Array(nextIv);
    }

    return new Blob(blobParts);
  }
}

async function* chunked(blob: Blob, padding: number, chunkSize: number): AsyncGenerator<ArrayBuffer> {
  for (let i = padding; i < blob.size; i += chunkSize) {
    yield await blob.slice(i, i + chunkSize).arrayBuffer();
  }
}

function generateIv(ivSize: number = IV_SIZE): Uint8Array {
  const iv = new Uint8Array(ivSize);
  return crypto.getRandomValues(iv), iv;
}

const SLICE_SIZE = 16_777_216; // 16 MiB
const IV_SIZE = 16;
const ALGORITHM = "AES-GCM";
