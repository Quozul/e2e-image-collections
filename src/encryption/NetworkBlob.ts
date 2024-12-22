import type { Slice } from "./AsyncBlob.ts";

export class NetworkBlob implements Slice {
	private constructor(
		private readonly _url: string,
		private readonly _size: number,
	) {}

	public static async load(url: string): Promise<NetworkBlob> {
		return getFileLength(url).then((size) => new NetworkBlob(url, size));
	}

	public async slice(start: number, end: number): Promise<ArrayBuffer> {
		const response = await fetch(this._url, {
			method: "GET",
			headers: {
				Range: `bytes=${start}-${end}`,
			},
		});

		if (!response.ok || response.status !== 206) {
			throw new Error("Unexpected response");
		}

		return await response.arrayBuffer();
	}

	public get size() {
		return this._size;
	}
}

async function getFileLength(url: string): Promise<number> {
	const response = await fetch(url, {
		method: "HEAD",
		mode: "cors",
	});
	if (!response.ok) {
		throw new Error(`Request failed with status code ${response.status}`);
	}
	const contentLength = response.headers.get("content-length");
	if (!contentLength) {
		throw new Error("No content length");
	}
	const parsed = Number.parseInt(contentLength);
	if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
		throw new Error("Invalid content length");
	}
	return parsed;
}
