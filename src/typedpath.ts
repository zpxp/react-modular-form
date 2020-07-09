import { Indexable } from "./types";

// to string methods that are called explicitly
const toStringMethods: (string | symbol | number)[] = ["path"];

// tostring methods/symbols that will be called implictly, such as placing a typedpath in a template string etc
const immediateToStringMethods: (string | symbol | number)[] = [Symbol.toPrimitive, Symbol.toStringTag, "valueOf", "toString"];

function pathToString(path: string[]): string {
	return path.reduce((current, next) => {
		if (+next === +next) {
			current += `[${next}]`;
		} else {
			current += current === "" ? `${next}` : `.${next}`;
		}

		return current;
	}, "");
}

function typedPathImpl<T>(path: string[], valuePipe?: (path: string, value: any) => boolean | void): TypedPath<T> {
	// since a typed path may contain an actual property called 'path' we need to allow for that.
	// we do this by proxying a function so we may go `tp.path.somemember` to access a literal member called path
	// or `tp.member.path()` to invoke the underlying function object which returns the string path
	return <TypedPath<T>>new Proxy(function () {} as any, {
		get(target: T & Indexable, name: string | number) {
			if (immediateToStringMethods.includes(name)) {
				return () => pathToString(path);
			} else if (target[name]) {
				return target[name];
			} else {
				const val = typedPathImpl([...path, name.toString()], valuePipe);
				// define the sub proxy on the target object so we dont have to keep creating it. expensive
				Object.defineProperty(target, name, {
					get() {
						return val;
					}
				});
				return val;
			}
		},
		// eslint-disable-next-line
		apply(target: T, thisArg: any, argArray?: any) {
			if (toStringMethods.includes(path[path.length - 1])) {
				// dont include the to string method invokation in the path
				path.pop();
			}
			return pathToString(path);
		},
		set(target: T, name: PropertyKey, value: any, receiver: any): boolean {
			if (valuePipe) {
				return (valuePipe(pathToString([...path, name.toString()]), value) as boolean) ?? true;
			} else {
				throw new Error("Cannot assign value to TypedPath. Did you forget to create path with 'valuePipe'?");
			}
		}
	});
}

/**
 * Create a TypedPath object for any type. TypedPath creates staticly typed path names
 * @param valuePipe An optional callback that is invoked with the path and value whenever a value is assigned to the typed path object
 */
export function createTypedPath<T>(valuePipe?: (path: string, value: any) => boolean | void): TypedPath<T> {
	return typedPathImpl<T>([], valuePipe);
}

export type TypedPathBase = {
	/** Return the string representation of the current path chain */
	path?(): string;
};

export type TypedPath<T> = { [P in keyof T]: TypedPath<T[P]> } & {
	/** Returns to TS type of the current property */
	type?(): T;
} & TypedPathBase;
