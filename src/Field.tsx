import * as React from "react";
import { MergeStyles } from "utils/mergeStyles";
import { IFormStateProvider, FormChangeEvent } from "./IStateProvider";
import { InjectedForm, InjectedField } from "./injectedForm";
import { IFormContext, _FormContext } from "./context";
import { DefaultFormStateProvider } from "./defaultFormStateProvider";
import { createTypedPath, TypedPath, TypedPathBase } from "utils/typedpath";
import objectutil from "utils/object";
import { RegisteredField } from "./registeredField";
import { ReactComponent, OmitUnion, CommonComponentProps, OmitName } from "z-types";
import { IFieldFormatter, IFieldFormatterMetadata } from "./IFieldFormatter";
import { FormValidatorType } from "./validators";

export class Field<TValue, TComponentProps extends object, TFormatterValue = TValue, TFormValue = any> extends React.PureComponent<
	FieldProps<TValue, TComponentProps, TFormatterValue, TFormValue>,
	State
> {
	static contextType = _FormContext;
	context: IFormContext<any>;

	private unsub: () => void;
	readonly field: RegisteredField;
	private clearAction: () => void;
	hasErrorOverride: boolean;

	constructor(props: FieldProps<TValue, TComponentProps, TFormatterValue, TFormValue>, context: IFormContext<any>) {
		super(props);
		this.context = context;
		this.state = {};

		this.uptake = this.uptake.bind(this);
		this.onChange = this.onChange.bind(this);

		this.unsub = this.context.watchChange(this.path, this.onChange);

		const field = this;
		this.field = {
			get path() {
				return field.path;
			},
			touched: false,
			isFieldArray: false,
			get error() {
				return field.context.getErrors()[field.path];
			}
		};

		this.context.registerField(this.field);
	}

	get path() {
		return typeof this.props.path === "string" ? this.props.path : this.props.path.path();
	}

	private onChange(path: string, value: TValue, event: FormChangeEvent) {
		if (path === this.path) {
			this.forceUpdate();
		}

		this.props.onChange?.(value);
	}

	componentWillUnmount() {
		this.context.unregisterField(this.field);
	}

	componentDidUpdate(prevProps: FieldProps<TValue, TComponentProps, TFormatterValue, TFormValue>, prevState: State) {
		if (prevProps.path !== this.props.path) {
			this.unsub();
			//create a new sub
			this.unsub = this.context.watchChange(this.path, this.onChange);
		}
	}

	private formatterMetadata(): IFieldFormatterMetadata<TValue> {
		return {
			path: this.path,
			field: this.field,
			setError: error => {
				this.context.setError(this.path, error);
				// eslint-disable-next-line eqeqeq
				this.hasErrorOverride = error == null;
			},
			getFormValue: () => this.context.getFormValue(),
			getDefaultValue: () => this.props.defaultValue,
			clear: () => this.context.setValue(this.props.path, null, "clearfield", this.clearAction)
		};
	}

	private uptake(value: TValue) {
		this.context.setValue(this.props.path, value, "change");
	}

	private getInjection(): InjectedField<TValue, TComponentProps, TFormatterValue> {
		const field = this;
		return {
			...(this.props.componentProps as any),
			fieldProps: {
				onChange: e => {
					let value: TFormatterValue;
					if (typeof e === "object" && "target" in e) {
						value = (e.target as any).value;
					} else {
						value = e as TFormatterValue;
					}
					if (this.props.formatter?.onChange) {
						this.props.formatter.onChange(value, this.uptake, this.formatterMetadata());
					} else {
						this.uptake(value as any);
					}
				},
				onBlur: e => {
					if (this.props.formatter?.onBlur) {
						this.props.formatter.onBlur(this.context.getValue(this.props.path), this.uptake, this.formatterMetadata());
					}
					this.props.onBlur?.(e);
				},
				onFocus: e => {
					if (this.props.formatter?.onFocus) {
						this.props.formatter.onFocus(this.context.getValue(this.props.path), this.uptake, this.formatterMetadata());
					}
					this.props.onFocus?.(e);
				},
				get value(): TFormatterValue {
					const pathVal = field.context.getValue(field.props.path);
					if (field.props.formatter?.downTake) {
						return field.props.formatter.downTake(pathVal, field.formatterMetadata());
					} else {
						return (pathVal as any) as TFormatterValue;
					}
				}
			},
			form: {
				getFormValue: () => {
					return this.context.getFormValue();
				},
				/** Set the callback that will be invoked whenever the form component implementation should clear its value from the dom */
				setClearCallback: action => {
					this.clearAction = action;
				},
				/** Manually set error from inside the form component. The error will need to be manually cleared by passing `null` or `undefined` */
				setError: error => this.context.setError(this.path, error),
				field: this.field
			},
			componentProps() {
				// filter all form specific props from this props object and return them, since this refers to the object
				const { form, fieldProps, componentProps, ...rest } = this;
				return rest;
			}
		};
	}

	render() {
		return <this.props.component {...(this.getInjection() as any)}>{this.props.children}</this.props.component>;
	}
}

export type FieldProps<TValue, TComponentProps extends object, TFormatterValue, TFormValue> = _FieldProps<
	TValue,
	TComponentProps,
	TFormatterValue,
	TFormValue
> &
	(TComponentProps extends { children: infer U } ? { children: U } : {});

interface _FieldProps<TValue, TComponentProps extends object, TFormatterValue, TFormValue> extends CommonComponentProps {
	path: TypedPath<TValue>;
	component: ReactComponent<InjectedField<TValue, TComponentProps, TFormatterValue>>;
	/** The props that will passed to `component` */
	componentProps?: OmitUnion<TComponentProps, InjectedField<TValue, TComponentProps, TFormatterValue>["fieldProps"] & { children: any }>;
	formatter?: IFieldFormatter<TValue, TFormatterValue>;
	validator?: FormValidatorType<TValue, TFormValue> | FormValidatorType<TValue, TFormValue>[];
	defaultValue?: TValue;
	onChange?(value: TValue): void;
	onBlur?(e: React.FocusEvent): void;
	onFocus?(e: React.FocusEvent): void;
}

interface State {}
