import { Job } from "@/encryption/worker/Job.ts";
import type { ClientMessages, WorkerMessages } from "./messages.ts";

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

export class EncryptionJob extends Job<EventMap> {
	constructor(
		private readonly _worker: Worker,
		private readonly _file: File,
	) {
		super();
	}

	public startJob() {
		this._worker.addEventListener("message", (event: MessageEvent) => {
			const message: WorkerMessages = event.data;
			if (message.jobId !== this._jobId) {
				return;
			}
			if (message.type === "encryptProgress") {
				this.dispatchTypedEvent(
					"onprogress",
					new EncryptionJobProgressEvent(message.progress),
				);
			} else if (message.type === "encryptComplete") {
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

		const message: ClientMessages = {
			type: "startEncryptJob",
			file: this._file,
			jobId: this._jobId,
		};
		this._worker.postMessage(message);
	}
}
