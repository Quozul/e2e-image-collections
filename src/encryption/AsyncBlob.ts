export interface Slice {
	slice: (start: number, end: number) => Promise<ArrayBufferLike>;
	size: number;
}

export class AsyncBlob implements Slice {
	public constructor(private readonly _blob: Blob) {}

	public slice(start: number, end: number): Promise<ArrayBuffer> {
		return this._blob.slice(start, end).arrayBuffer();
	}

	public get size(): number {
		return this._blob.size;
	}
}

export class AsyncArrayBuffer implements Slice {
	public constructor(private readonly _arrayBuffer: ArrayBufferLike) {}

	public async slice(start: number, end: number): Promise<ArrayBufferLike> {
		return this._arrayBuffer.slice(start, end);
	}

	public get size(): number {
		return this._arrayBuffer.byteLength;
	}
}
