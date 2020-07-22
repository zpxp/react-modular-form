/**
 * Interface to implement to define custom form state storage
 */
export interface IFormStateProvider<TFormValue> {
	/**
	 * Read the current form state
	 */
	readState(): TFormValue;
	/**
	 * Write the current form state
	 * @param newState The new state value
	 * @param changePath The path within the state that changed. Will be `null` if the entire state value changed
	 * @param changeEvent The state modification event type
	 */
	writeState(newState: TFormValue, changePath: string, changeEvent: FormChangeEvent): void;
}

/**
 * Type of event that triggered this state change
 *
 * `change`:
 * 	 any field change event
 *
 * `defaultVal`:
 * 	 event from setting default values
 *
 * `reset`:
 * 	 called on form reset
 *
 * `initialize`:
 * 	 any event that sets the state back to `initialValues` or a blank state
 *
 * `clearfield`:
 * 	 called on clearing a field
 */
export type FormChangeEvent = "change" | "defaultVal" | "initialize" | "reset" | "clearfield";
