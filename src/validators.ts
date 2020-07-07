import { RegisteredField } from "./registeredField";

export type FormValidatorType<TValue, TFormValue> = (val: TValue, formVal?: TFormValue, field?: RegisteredField) => string | void;

const emailReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

/**
 * defined validator functions must be of type `FormValidatorType`
 */
export class FormValidators {
	static required<TValue>(value: TValue) {
		if (!value) {
			return "Field is Required";
		}
	}

	static isEmail(val: string) {
		if (!emailReg.test(val)) {
			return "Invalid Email";
		}
	}
}
