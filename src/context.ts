import * as React from "react";
import { FormChangeEvent } from "./IStateProvider";
import { TypedPath } from "utils/typedpath";

export const _FormContext: React.Context<IFormContext<any>> = React.createContext<IFormContext<any>>({} as any);

export interface IFormContext<TFormValue> {
	watchChange(path: string, action: (pathThatChanged: string, newValue: any, event: FormChangeEvent) => void): () => void;
	getValue<T>(path: string | TypedPath<T>): T;
	setValue<T>(path: string | TypedPath<T>, value: T, type: FormChangeEvent, callback?: () => void): void;
	getFormValue(): TFormValue;
	setError(path: string, error: string): void;
}
