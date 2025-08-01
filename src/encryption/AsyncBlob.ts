export interface Slice {
	slice: (start: number, end: number) => Promise<ArrayBuffer>;
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
	public constructor(private readonly _arrayBuffer: ArrayBuffer) {}

	public async slice(start: number, end: number): Promise<ArrayBuffer> {
		return this._arrayBuffer.slice(start, end);
	}

	public get size(): number {
		return this._arrayBuffer.byteLength;
	}
}

export class AsyncSliceReader {
	private _offset = 0;
	constructor(private _slice: Slice) {}

	async read(bytes: number): Promise<ArrayBuffer | null> {
		if (this.isDone()) {
			return null;
		}
		const end = Math.min(this._offset + bytes, this._slice.size);
		const buffer = await this._slice.slice(this._offset, end);
		this._offset = end;
		return buffer.byteLength > 0 ? buffer : null;
	}

	isDone(): boolean {
		return this._offset >= this._slice.size;
	}
}
