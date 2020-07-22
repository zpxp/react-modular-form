import { RegisteredField } from "./registeredField";

/**
 * Interface to build an intercepter object that can be used to format field values when they trigger certian events
 */
export interface IFieldFormatter<TValue, TFormatterValue = TValue> {
	/**
	 * Called when the field triggers an `onChange`
	 * @param incomingFieldVal the incoming value from the field
	 * @param uptake Optionally call this to rerender the form and uptake given value
	 * @param metadata Utilities for this field
	 */
	onChange?(incomingFieldVal: TFormatterValue, uptake: (formVal: TValue) => void, metadata: IFieldFormatterMetadata<TValue>): void;

	/**
	 * Called when the field triggers an `onBlur`
	 * @param currentFormVal Current value of form
	 * @param uptake Optionally call this to rerender the form and uptake given value
	 * @param metadata Utilities for this field
	 */
	onBlur?(currentFormVal: TValue, uptake: (formVal: TValue) => void, metadata: IFieldFormatterMetadata<TValue>): void;

	/**
	 * Called when the field triggers an `onFocus`
	 * @param currentFormVal Current value of form
	 * @param uptake Optionally call this to rerender the form and uptake given value
	 * @param metadata Utilities for this field
	 */
	onFocus?(currentFormVal: TValue, uptake: (formVal: TValue) => void, metadata: IFieldFormatterMetadata<TValue>): void;

	/**
	 * Recieve the form value and convert into a format suitable for the field
	 * @param currentFormVal Value from the form state
	 * @param metadata Utilities for this field
	 */
	downTake?(currentFormVal: TValue, metadata: IFieldFormatterMetadata<TValue>): TFormatterValue;
}

/**
 * Infomation and helper utilities
 */
export interface IFieldFormatterMetadata<TValue> {
	readonly path: string;
	readonly field: RegisteredField;
	setError(error: string): void;
	getFormValue<TFormValue>(): TFormValue;
	getDefaultValue(): TValue;
	clear(): void;
}
