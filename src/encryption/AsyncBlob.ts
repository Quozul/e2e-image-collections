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
