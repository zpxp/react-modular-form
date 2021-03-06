export interface RegisteredField {
	path: string;
	touched: boolean;
	dirty: boolean;
	isFieldArray: boolean;
	error: string;
	getErrors(touch: boolean, rerender: boolean): string;
}
