import { TypedEventTarget } from "typescript-event-target";

type ValueIsEvent<T> = {
	[key in keyof T]: Event;
};

export abstract class Job<
	T extends ValueIsEvent<T>,
> extends TypedEventTarget<T> {
	private static jobCounter = 0;
	protected readonly _jobId: number;

	protected constructor() {
		super();
		this._jobId = Job.jobCounter++;
	}

	abstract startJob(password: string): void;
}
