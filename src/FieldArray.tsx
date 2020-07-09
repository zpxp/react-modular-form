import * as React from "react";
import { MergeStyles } from "./mergeStyles";
import { IFormStateProvider, FormChangeEvent } from "./IStateProvider";
import { InjectedForm, InjectedField, InjectedFieldArray } from "./injectedForm";
import { IFormContext, _FormContext } from "./context";
import { DefaultFormStateProvider } from "./defaultFormStateProvider";
import { createTypedPath, TypedPath, TypedPathBase } from "./typedpath";
import objectutil from "./object";
import { RegisteredField } from "./registeredField";
import { FormValidatorType } from "./validators";
import { CommonComponentProps } from "./types";

let keyIndex = 0;
const keySym = typeof Symbol === "undefined" ? "$$form_fieldArrayKey" : Symbol.for("$$form_fieldArrayKey");

// add merge styles so we can use consumer styles in functional children
@MergeStyles({})
export class FieldArray<TValue, TFormValue = any> extends React.PureComponent<FieldArrayProps<TValue[], TFormValue>, State<TValue>> {
	static contextType = _FormContext;
	context: IFormContext<any>;

	private unsub: () => void;
	readonly field: RegisteredField;

	constructor(props: FieldArrayProps<TValue[], TFormValue>, context: IFormContext<any>) {
		super(props);
		this.context = context;

		this.onChange = this.onChange.bind(this);

		this.unsub = this.context.watchChange(this.path, this.onChange);

		const field = this;
		this.field = {
			get path() {
				return field.path;
			},
			touched: false,
			isFieldArray: true,
			get error() {
				return field.context.getErrors()[field.path];
			},
			getErrors: this.getErrors
		};

		this.state = {
			injection: this.getInjection()
		};
	}

	get path() {
		return typeof this.props.path === "string" ? this.props.path : this.props.path.path();
	}

	private onChange(path: string, value: TValue[], event: FormChangeEvent) {
		if (path === this.path) {
			this.forceUpdate();
		}

		this.props.onChange?.(value);
	}

	getErrors(touch: boolean, rerender: boolean): string {
		if (touch) {
			this.field.touched = true;
		}
		if (rerender) {
			// need to rerender
			this.forceUpdate();
		}
		if (!this.props.validation) {
			return null;
		}

		const formVal = this.context.getFormValue();
		const value = this.context.getValue<TValue[]>(this.props.path);

		if (Array.isArray(this.props.validation)) {
			for (const validator of this.props.validation) {
				const error = validator(value, formVal, this.field);
				if (error) {
					return error;
				}
			}
		} else {
			const error = this.props.validation(value, formVal, this.field);
			if (error) {
				return error;
			}
		}
		return null;
	}

	componentDidUpdate(prevProps: FieldArrayProps<TValue[], TFormValue>) {
		if (prevProps.path !== this.props.path) {
			this.unsub();
			//create a new sub
			this.unsub = this.context.watchChange(this.path, this.onChange);
		}
	}

	private getKey(item: TValue, index: number) {
		if (typeof item === "object" || typeof item === "function") {
			if (!(keySym in item)) {
				(item as any)[keySym] = ++keyIndex;
			}
			return (item as any)[keySym];
		} else {
			return item + index.toString();
		}
	}

	private getInjection(): InjectedFieldArray<TValue> {
		const getArray = () => {
			return this.context.getValue(this.props.path) || [];
		};
		const field = this;

		return {
			map: (action) => {
				const arr = getArray();
				return arr.map((val, index) => {
					return action(this.props.path[index], index, this.getKey(val, index));
				});
			},
			forEach: (action) => {
				const arr = getArray();
				arr.forEach((val, index) => {
					action(this.props.path[index], this.getKey(val, index), index);
				});
			},
			push: (item, callback) => {
				const arr = getArray().slice();
				arr.push(item as TValue);
				this.context.setValue(this.props.path, arr, "change", callback);
			},
			unshift: (item, callback) => {
				const arr = getArray().slice();
				arr.unshift(item as TValue);
				this.context.setValue(this.props.path, arr, "change", callback);
			},
			insert: (index, item, callback) => {
				const arr = getArray().slice();
				arr.splice(index, 0, item as TValue);
				this.context.setValue(this.props.path, arr, "change", callback);
			},
			splice: (start, count = 1, newItems, callback) => {
				const arr = getArray().slice();
				arr.splice(start, count, ...newItems);
				this.context.setValue(this.props.path, arr, "change", callback);
			},
			get: (index) => {
				const arr = getArray();
				return arr[index];
			},
			value: () => {
				const arr = getArray();
				return arr;
			},
			move: (from, to, callback) => {
				const arr = getArray().slice();
				arr.splice(to, 0, ...arr.splice(from, 1));
				this.context.setValue(this.props.path, arr, "change", callback);
			},
			pop: (callback) => {
				const arr = getArray().slice();
				const item = arr.pop();
				this.context.setValue(this.props.path, arr, "change", callback);
				return item;
			},
			shift: (callback) => {
				const arr = getArray().slice();
				const item = arr.shift();
				this.context.setValue(this.props.path, arr, "change", callback);
				return item;
			},
			clear: (callback) => {
				this.context.setValue(this.props.path, this.props.defaultValue ?? [], "change", callback);
			},
			swap: (index1, index2, callback) => {
				const arr = getArray().slice();
				[arr[index1], arr[index2]] = [arr[index2], arr[index1]];
				this.context.setValue(this.props.path, arr, "change", callback);
			},
			get length() {
				return getArray().length;
			},
			get error() {
				return field.context.getErrors()[field.path];
			}
		};
	}

	render() {
		return this.props.children(this.state.injection);
	}
}

export interface FieldArrayProps<TArrayValue extends any[], TFormValue> extends CommonComponentProps {
	path: TypedPath<TArrayValue>;
	children(injection: InjectedFieldArray<TArrayValue[0]>): React.ReactNode;
	validation?: FormValidatorType<TArrayValue, TFormValue> | FormValidatorType<TArrayValue, TFormValue>[];
	defaultValue?: TArrayValue;
	/** any `styleName`s on functional children's jsx will need their styles passed in here */
	classes?: object;
	onChange?(value: TArrayValue): void;
}

interface State<TValue> {
	injection: InjectedFieldArray<TValue>;
}
