import { IFormStateProvider } from "./IStateProvider";

export class DefaultFormStateProvider<TValue> implements IFormStateProvider<TValue> {
	private state: TValue;

	readState(): TValue {
		return this.state;
	}

	writeState(newState: TValue): void {
		this.state = newState;
	}
}
