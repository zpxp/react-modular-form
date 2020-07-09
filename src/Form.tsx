import * as React from "react";
import { MergeStyles } from "utils/mergeStyles";
import { IFormStateProvider, FormChangeEvent } from "./IStateProvider";
import { InjectedForm } from "./injectedForm";
import { IFormContext, _FormContext } from "./context";
import { DefaultFormStateProvider } from "./defaultFormStateProvider";
import { createTypedPath, TypedPath, TypedPathBase } from "utils/typedpath";
import objectutil from "utils/object";
import { RegisteredField } from "./registeredField";

// add merge styles so we can use consumer styles in functional children
@MergeStyles({})
export class Form<TFormState extends object> extends React.PureComponent<FormPropsConfig<TFormState>, State<TFormState>> {
	readonly path: TypedPath<TFormState>;
	private errors: { [path: string]: string } = {};
	private changeWatchers: ChangeWatcher[] = [];
	private registeredFields: RegisteredField[] = [];

	constructor(props: FormPropsConfig<TFormState>) {
		super(props);

		this.path = createTypedPath<TFormState>((path, value) => {
			// value changes are feed thru the tp
			this.beginChange(path, value, "change");
		});

		this.watchChange = this.watchChange.bind(this);
		this.beginChange = this.beginChange.bind(this);
		this.registerField = this.registerField.bind(this);
		this.unregisterField = this.unregisterField.bind(this);

		this.state = {
			context: {
				watchChange: this.watchChange,
				getValue: path => objectutil.getValue(this.state.stateProvider.readState(), typeof path === "string" ? path : path.path()),
				getFormValue: () => this.state.stateProvider.readState(),
				setError: (path, error) => {
					this.errors[path] = error;
				},
				setValue: this.beginChange,
				getErrors: () => this.errors,
				registerField: this.registerField,
				unregisterField: this.unregisterField
			},
			changeCount: 0,
			injection: this.createInjection(),
			stateProvider: this.props.stateProvider ?? new DefaultFormStateProvider<TFormState>()
		};

		if (!this.state.stateProvider.readState() || (this.props.initialValues && this.props.enableReinitialize)) {
			this.state.stateProvider.writeState((this.props.initialValues || {}) as TFormState, null, "initialize");
		}
	}

	private registerField(field: RegisteredField) {
		this.registeredFields.push(field);
	}

	private unregisterField(field: RegisteredField) {
		this.registeredFields.remove(field);
	}

	private createInjection(): InjectedForm<TFormState> {
		return {
			paths: this.path,
			handleSubmit: (onSuccess, onFail, force) => {
				if (force || !this.checkValid(true, true)) {
					return onSuccess(this.state.stateProvider.readState());
				} else {
					return onFail?.({ ...this.errors });
				}
			},
			reset: () => {
				this.errors = {};
				this.beginChange(null, this.props.initialValues || {}, "defaultVal");
			},
			setValue: (path, value, callback) => {
				this.beginChange(path, value, "change", callback);
			},
			getValue: path => {
				return objectutil.getValue(this.state.stateProvider.readState(), typeof path === "string" ? path : path.path());
			},
			clearField: (path, callback) => {
				this.beginChange(path, null, "clearfield", callback);
			},
			isValid: () => {
				return this.checkValid(false, false);
			},
			checkValid: () => {
				return this.checkValid(true, true);
			},
			isTouched: () => {
				return this.registeredFields.some(x => x.touched);
			},
			getErrors: () => {
				return { ...this.errors };
			},
			rerenderOnChange: (path: (string | TypedPathBase) | Array<string | TypedPathBase>, component: React.Component) => {
				return this.watchChange(path, () => component.forceUpdate());
			},
			watchChange: this.watchChange,
			getFormValue: path => {
				return objectutil.getValue(this.state.stateProvider.readState(), typeof path === "string" ? path : path.path());
			}
		};
	}

	checkValid(touch: boolean, rerender: boolean) {
		this.errors = {};
		let hasError = false;
		for (const field of this.registeredFields) {
			const error = field.getErrors(touch, rerender);
			if (error) {
				hasError = true;
				this.errors[field.path] = error;
			} else {
				delete this.errors[field.path];
			}
		}
		return hasError;
	}

	private watchChange(
		path: (string | TypedPathBase) | Array<string | TypedPathBase>,
		action: (pathThatChanged: string, newValue: any, event: FormChangeEvent) => void
	) {
		if (Array.isArray(path)) {
			const watchers: ChangeWatcher[] = path.map(p => {
				const watcher = {
					path: typeof p === "string" ? p : p.path(),
					cb: action
				};
				this.changeWatchers.push(watcher);
				return watcher;
			});

			return () => {
				this.changeWatchers = this.changeWatchers.filter(x => !watchers.includes(x));
			};
		} else {
			const watcher = {
				path: typeof path === "string" ? path : path.path(),
				cb: action
			};
			this.changeWatchers.push(watcher);

			return () => {
				this.changeWatchers.removeItem(watcher);
			};
		}
	}

	private beginChange(_path: string | TypedPath<any>, value: any, event: FormChangeEvent, callback?: (val: any) => void) {
		const path = typeof _path === "string" ? _path : _path.path();
		const currentValue = this.state.stateProvider.readState();
		const newValue = objectutil.setValue(currentValue, path, value, this.props.pure);
		this.props.onChangeBegin?.(path, value, currentValue, newValue);
		this.state.stateProvider.writeState(newValue, path, event);
		this.setState(
			prev => ({ changeCount: prev.changeCount + 1 }),
			() => {
				this.props.onChange?.(path, value, newValue, currentValue);
				callback?.(value);
			}
		);
		for (const watcher of this.changeWatchers) {
			if (watcher.path === path) {
				watcher.cb(path, value, event);
			}
		}
	}

	render() {
		return <_FormContext.Provider value={this.state.context}>{this.props.children(this.state.injection)}</_FormContext.Provider>;
	}
}

export interface FormPropsConfig<TFormState> {
	/** Initial values of the form */
	initialValues?: Partial<TFormState>;
	/** Shallow clone the objects and arrays along the value path when a form value changes. Defaults to `false` */
	pure?: boolean;
	/** When set to `true`, the form will reinitialize every time the initialValues prop changes. Defaults to `false`. */
	enableReinitialize?: boolean;
	/**
	 * Throw an error if the same field path is registered twice.
	 *
	 * Use this if you wish to have multiple fields point to the same path or if using drag n drop fields, as that will temporaraly duplicate fields.
	 * Defaults to `true`
	 * */
	strictFieldRegistration?: boolean;

	/** Console log changes to the form */
	debugMode?: boolean;

	children(state: InjectedForm<TFormState>): React.ReactNode;
	/** any `styleName`s on functional children will need their styles passed in here */
	classes?: object;
	/** Called when a value changes but before the state updates */
	onChangeBegin?<R>(path: string, pathValue?: R, currentformValue?: TFormState, newValue?: TFormState): void;
	/** Called when a value changes. This is called after the state has changed and the render complete */
	onChange?<R>(path: string, pathValue?: R, newFormValue?: TFormState, prevFormValue?: TFormState): void;

	/**
	 * Supply a custom state provider to define form state storage strategy.
	 *
	 * Defaults to a provider that is scoped to the lifetime of the `Form` component
	 */
	stateProvider?: IFormStateProvider<TFormState>;
}

interface State<TFormState> {
	context: IFormContext<TFormState>;
	/**
	 * number of times the form has been changed. also used to rerender the component i.e. state changed since we store that actual form state in
	 * the provider class
	 */
	changeCount: number;
	stateProvider: IFormStateProvider<TFormState>;
	injection: InjectedForm<TFormState>;
}

type ChangeWatcher = {
	/** callback */
	cb: (path: string, newValue: any, event: FormChangeEvent) => void;
	path: string;
};
