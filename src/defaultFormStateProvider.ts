import { IFormStateProvider } from "./IStateProvider";

export class DefaultFormStateProvider<TVal> implements IFormStateProvider<TVal> {
	private state: TVal;

	readState(): TVal {
		return this.state;
	}

	writeState(newState: TVal): void {
		this.state = newState;
	}
}
