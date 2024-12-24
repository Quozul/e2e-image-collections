import { Job } from "@/encryption/worker/Job.ts";
import type { ClientMessages, WorkerMessages } from "./messages.ts";

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
	oncomplete: EncryptionJobCompleteEvent;
	onerror: EncryptionJobErrorEvent;
};

export class EncryptionJob extends Job<EventMap> {
	constructor(
		private readonly _worker: Worker,
		private readonly _file: Blob,
	) {
		super();
	}

	public startJob(password: string) {
		this._worker.addEventListener("message", this.handleMessage.bind(this));

		const message: ClientMessages = {
			type: "startEncryptJob",
			file: this._file,
			jobId: this._jobId,
			password,
		};
		this._worker.postMessage(message);
	}

	private handleMessage(event: MessageEvent) {
		const message: WorkerMessages = event.data;
		if (message.jobId !== this._jobId) {
			return;
		}
		if (message.type === "encryptComplete") {
			this.dispatchTypedEvent("oncomplete", new EncryptionJobCompleteEvent());
			this._worker.removeEventListener("message", this.handleMessage);
		} else if (message.type === "error") {
			this.dispatchTypedEvent(
				"onerror",
				new EncryptionJobErrorEvent(message.error),
			);
			this._worker.removeEventListener("message", this.handleMessage);
		}
	}
}
