import { TypedPath, TypedPathBase } from "./typedpath";
import { RegisteredField } from "./registeredField";
import { FormChangeEvent } from "./IStateProvider";
import { OmitUnion } from "./types";

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
	/** like `isValid` but rerenders and touches all fields */
	checkValid(): boolean;
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

export type InjectedField<TValue, TComponentProps extends object, TFieldValue = TValue> = _InjectedField<
	TValue,
	TComponentProps,
	TFieldValue
> &
	OmitUnion<TComponentProps, _InjectedField<TValue, TComponentProps, TFieldValue>["fieldProps"]>;

interface _InjectedField<TValue, TComponentProps extends object, TFieldValue> {
	readonly fieldProps: {
		onChange(f: TFieldValue | React.ChangeEvent<HTMLElement>): void;
		onBlur(e: React.FocusEvent): void;
		onFocus(e: React.FocusEvent): void;
		readonly value: TFieldValue;
	};
	/** Form and field specific props */
	readonly form: {
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

export interface InjectedFieldArray<TValue> {
	/**
	 * Map each item in the array. `key` is a unique value for each item in the array
	 * @param action
	 */
	map(action: (path: TypedPath<TValue>, key?: number | string, index?: number) => React.ReactNode): React.ReactNode[];
	/** Get item at index */
	get(index: number): TValue;
	/** Return all items in underlying array */
	value(): TValue[];
	/** Moves an element from one index in the array to another. */
	move(from: number, to: number, cb?: (newArray: TValue[]) => void): void;
	/** Removes an item from the end of the array. Returns the item removed. */
	pop(callback?: (newArray: TValue[]) => void): TValue;
	/** Removes an item from beginning of the array. Returns the item removed. */
	shift(callback?: (newArray: TValue[]) => void): TValue;
	/** Removes all the values from the array. */
	clear(callback?: (newArray: TValue[]) => void): void;
	/** Swap 2 items */
	swap(index1: number, index2: number, callback?: (newArray: TValue[]) => void): void;
	/** `itemId` is a unique id for this item inside this `FieldArray`. Use it to map `key` props on JSX elements */
	forEach(action: (path: TypedPath<TValue>, value: TValue, index?: number, itemId?: number) => void): void;
	/** add an item to the array */
	push(item: Partial<TValue>, callback?: (newArray: TValue[]) => void): void;
	/** Adds an item to the beginning of the array. Returns nothing. */
	unshift(item: Partial<TValue>, callback?: (newArray: TValue[]) => void): void;
	/** Insert item at index */
	insert(index: number, item: Partial<TValue>, callback?: (newArray: TValue[]) => void): void;
	/** Array splice */
	splice(start: number, deleteCount?: number, newItems?: TValue[], callback?: (newArray: TValue[]) => void): void;

	/** Number of items in underlying list */
	readonly length: number;

	/** Any validation error for this field array */
	readonly error: string;
}
