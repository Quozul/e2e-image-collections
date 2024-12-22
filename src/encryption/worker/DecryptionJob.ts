import { TypedEventTarget } from "typescript-event-target";
import type { ApiEncryptionWorkerMessage } from "./messages.ts";

export class DecryptionJobProgressEvent extends Event {
	constructor(readonly progress: number) {
		super("onprogress");
	}
}
export class DecryptionJobCompleteEvent extends Event {
	constructor(
		readonly blob: Blob,
		readonly fileName: string,
	) {
		super("oncomplete");
	}
}
export class DecryptionJobErrorEvent extends Event {
	constructor(readonly error: unknown) {
		super("onerror");
	}
}

type EventMap = {
	onprogress: DecryptionJobProgressEvent;
	oncomplete: DecryptionJobCompleteEvent;
	onerror: DecryptionJobErrorEvent;
};

export class DecryptionJob extends TypedEventTarget<EventMap> {
	constructor(
		private readonly _worker: Worker,
		private readonly _fileName: string,
	) {
		super();
	}

	public startJob() {
		this._worker.postMessage({
			type: "decryptBlob",
			fileName: this._fileName,
		});
		this._worker.addEventListener("message", (event: MessageEvent) => {
			const message: ApiEncryptionWorkerMessage = event.data;
			if (message.type === "progress") {
				this.dispatchTypedEvent(
					"onprogress",
					new DecryptionJobProgressEvent(message.progress),
				);
			} else if (message.type === "decryptedBlob") {
				this.dispatchTypedEvent(
					"oncomplete",
					new DecryptionJobCompleteEvent(message.blob, message.fileName),
				);
			} else if (message.type === "error") {
				this.dispatchTypedEvent(
					"onerror",
					new DecryptionJobErrorEvent(message.error),
				);
			} else {
				console.error(`Unknown message type ${message.type}`);
			}
		});
	}
}
