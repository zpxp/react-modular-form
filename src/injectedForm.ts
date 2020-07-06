import { TypedPath, TypedPathBase } from "utils/typedpath";
import { RegisteredField } from "./registeredField";
import { OmitUnion } from "z-types";
import { FormChangeEvent } from "./IStateProvider";

export interface InjectedForm<TFormState> {
	readonly paths: TypedPath<TFormState>;
	/**
	 * Call to submit the form. returns the return value from callback functions
	 * @param onSuccess function to call if form is valid
	 * @param onFail function to call if form is invalid
	 * @param force bypass validations and call `onSuccess` with current form state
	 */
	handleSubmit<R = void>(onSuccess: (data: TFormState) => R, onFail?: (errors: { [path: string]: string }) => R, force?: boolean): R;
	/** Revert the form back to  `initialValues` or `{}` */
	reset(): void;
	setValue<T>(path: string | TypedPath<T>, value: T, callback?: () => void): void;
	getValue<T>(path: string | TypedPath<T>): T;
	/** set the value at the path to `null` and invoke any `clearCallback`s at that path  */
	clearField<T>(path: string | TypedPath<T>, callback?: () => void): void;
	isValid(): boolean;
	isTouched(): boolean;
	getErrors(): { [paths: string]: string };
	/**
	 * Force rerender instance of react component whenever value at path changes. Is affected by `cascadeFieldRenderingPropagation`. Returns an unsubscribe function
	 * @param path Rerender when value at this path changes
	 * @param componentToRerender Component instance to rerender
	 * @returns An unsub function
	 */
	rerenderOnChange(path: string | TypedPathBase, componentToRerender: React.Component): () => void;
	rerenderOnChange(paths: Array<string | TypedPathBase>, componentToRerender: React.Component): () => void;

	/**
	 * Watch for changes in the form state and call action on change. Returns an unsubscribe function
	 * @param path path to watch
	 * @param action action to call then value at path change
	 * @returns An unsub function
	 */
	watchChange<T>(path: string | TypedPath<T>, action: (pathThatChanged: string, newValue: T, event: FormChangeEvent) => void): () => void;
	watchChange(
		paths: Array<string | TypedPathBase>,
		action: (pathThatChanged: string, newValue: any, event: FormChangeEvent) => void
	): () => void;

	getFormValue<T>(path: string | TypedPath<T>): T;
}

export interface InjectedField<TValue, TComponentProps, TFieldValue> {
	fieldProps: {
		onChange(f: TFieldValue | React.ChangeEvent<HTMLInputElement>): void;
		onBlur(e: React.FocusEvent): void;
		onFocus(e: React.FocusEvent): void;
		readonly value: TFieldValue;
	};
	/** Form and field specific props */
	form: {
		getFormValue<TFormValue>(): TFormValue;
		/** Set the callback that will be invoked whenever the form component implementation should clear its value from the dom */
		setClearCallback(action: () => void): void;
		/** Manually set error from inside the form component. The error will need to be manually cleared by passing `null` or `undefined` */
		setError(error: string): void;
		readonly field: RegisteredField;
	};
	/**
	 * Returns all the component props on this object with form specific props filtered out.
	 *
	 * Equivalent of:
	 *
	 * 	const { form, fieldProps, ...rest } = this.props;
	 */
	componentProps(): OmitUnion<TComponentProps, InjectedField<TValue, TComponentProps, TFieldValue>["fieldProps"]>;
}
