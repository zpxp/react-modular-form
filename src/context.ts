import * as React from "react";
import { FormChangeEvent } from "./IStateProvider";
import { TypedPath } from "utils/typedpath";
import { RegisteredField } from "./registeredField";

export const _FormContext: React.Context<IFormContext<any>> = React.createContext<IFormContext<any>>({} as any);

export interface IFormContext<TFormValue> {
	watchChange(path: string, action: (pathThatChanged: string, newValue: any, event: FormChangeEvent) => void): () => void;
	getValue<T>(path: string | TypedPath<T>): T;
	setValue<T>(path: string | TypedPath<T>, value: T, type: FormChangeEvent, callback?: (value: T) => void): void;
	getFormValue(): TFormValue;
	setError(path: string, error: string): void;
	getErrors(): { [path: string]: string };
	registerField(field: RegisteredField): void;
	unregisterField(field: RegisteredField): void;
}
