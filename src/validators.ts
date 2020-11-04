import { RegisteredField } from "./registeredField";

export type FormValidatorType<TValue, TFormValue> = (val: TValue, formVal?: TFormValue, field?: RegisteredField) => string | void;

const emailReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const urlReg = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
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

	static isUrl(val: string) {
		if (!val) {
			return;
		}
		if (!urlReg.test(val)) {
			return "Invalid Url";
		}
	}
}
