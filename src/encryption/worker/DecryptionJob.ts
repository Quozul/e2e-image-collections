import { Job } from "@/encryption/worker/Job.ts";
import type { ClientMessages, WorkerMessages } from "./messages.ts";

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

export class DecryptionJob extends Job<EventMap> {
	constructor(
		private readonly _worker: Worker,
		private readonly _fileName: string,
		private readonly _password: string,
	) {
		super();
	}

	public startJob() {
		this._worker.addEventListener("message", (event: MessageEvent) => {
			const message: WorkerMessages = event.data;
			if (message.type === "decryptProgress") {
				this.dispatchTypedEvent(
					"onprogress",
					new DecryptionJobProgressEvent(message.progress),
				);
			} else if (message.type === "decryptComplete") {
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

		const message: ClientMessages = {
			type: "startDecryptJob",
			fileName: this._fileName,
			jobId: this._jobId,
			password: this._password,
		};
		this._worker.postMessage(message);
	}
}
