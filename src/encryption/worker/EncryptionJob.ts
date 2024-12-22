import { TypedEventTarget } from "typescript-event-target";
import type { ApiEncryptionWorkerMessage } from "./messages.ts";

export class EncryptionJobProgressEvent extends Event {
	constructor(readonly progress: number) {
		super("onprogress");
	}
}
export class EncryptionJobCompleteEvent extends Event {
	constructor() {
		super("oncomplete");
	}
}
export class EncryptionJobErrorEvent extends Event {
	constructor(readonly error: unknown) {
		super("onerror");
	}
}

type EventMap = {
	onprogress: EncryptionJobProgressEvent;
	oncomplete: EncryptionJobCompleteEvent;
	onerror: EncryptionJobErrorEvent;
};

export class EncryptionJob
	extends TypedEventTarget<EventMap>
	implements Disposable
{
	constructor(
		private readonly _worker: Worker,
		private readonly _file: File,
	) {
		super();
	}

	public startJob() {
		this._worker.postMessage({
			type: "encryptBlob",
			file: this._file,
		});
		this._worker.addEventListener("message", (event: MessageEvent) => {
			const message: ApiEncryptionWorkerMessage = event.data;
			if (message.type === "progress") {
				this.dispatchTypedEvent(
					"onprogress",
					new EncryptionJobProgressEvent(message.progress),
				);
			} else if (message.type === "uploadDone") {
				this.dispatchTypedEvent("oncomplete", new EncryptionJobCompleteEvent());
			} else if (message.type === "error") {
				this.dispatchTypedEvent(
					"onerror",
					new EncryptionJobErrorEvent(message.error),
				);
			} else {
				console.error(`Unknown message type ${message.type}`);
			}
		});
	}

	[Symbol.dispose]() {
		console.log("EncryptionJob disposed");
	}
}
