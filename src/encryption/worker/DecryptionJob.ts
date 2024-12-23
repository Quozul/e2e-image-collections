import { Job } from "@/encryption/worker/Job.ts";
import type { ClientMessages, WorkerMessages } from "./messages.ts";

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
	oncomplete: DecryptionJobCompleteEvent;
	onerror: DecryptionJobErrorEvent;
};

export class DecryptionJob extends Job<EventMap> {
	constructor(
		private readonly _worker: Worker,
		private readonly _fileName: string,
	) {
		super();
	}

	public startJob(password: string) {
		this._worker.addEventListener("message", this.handleMessage.bind(this));

		const message: ClientMessages = {
			type: "startDecryptJob",
			fileName: this._fileName,
			jobId: this._jobId,
			password,
		};
		this._worker.postMessage(message);
	}

	private handleMessage(event: MessageEvent) {
		const message: WorkerMessages = event.data;
		if (message.type === "decryptComplete") {
			this.dispatchTypedEvent(
				"oncomplete",
				new DecryptionJobCompleteEvent(message.blob, message.fileName),
			);
			this._worker.removeEventListener("message", this.handleMessage);
		} else if (message.type === "error") {
			this.dispatchTypedEvent(
				"onerror",
				new DecryptionJobErrorEvent(message.error),
			);
			this._worker.removeEventListener("message", this.handleMessage);
		}
	}
}
