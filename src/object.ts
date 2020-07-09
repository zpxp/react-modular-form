import { Indexable } from "./types";

export default class objectutil {
	/**
	 * Return value at path in given object
	 * @param obj
	 * @param path
	 */
	static getValue<T>(obj: T, path: string): any {
		let rtns = obj;
		const paths = path.split(".");
		for (let index = 0; index < paths.length && rtns; index++) {
			let p = paths[index];
			const arr = p.match(/\[(\d+)\]/g);
			if (arr && arr.length) {
				for (const item of arr) {
					//get array prop then index of item
					p = p && /^[^\[]*/.exec(p)[0];
					if (p) {
						rtns = (rtns as Indexable)[p][/\d+/.exec(item)[0]];
						p = null;
					} else {
						rtns = (rtns as Indexable)[/\d+/.exec(item)[0]];
					}
				}
			} else {
				rtns = (rtns as Indexable)[p];
			}
		}
		return rtns;
	}

	/**
	 * Dynamicly add `val` to object `item` and given path
	 * @param item Item to add val to
	 * @param path path to add val at
	 * @param val
	 */
	static setValue<T>(item: T, path: string, val: any, pure: boolean): T {
		let paths: Path[] = null;

		if (path.startsWith("[")) {
			paths = [];
		} else if (!path) {
			if (pure) {
				return Array.isArray(item) ? (item.slice() as any) : item ? { ...item } : item;
			} else {
				return item;
			}
		} else {
			paths = [
				{
					member: "",
					isArray: Array.isArray(item)
				}
			];
		}

		for (const char of path) {
			if (char === ".") {
				paths.push({ member: "", isArray: false });
			} else if (char === "[") {
				paths.push({ member: "", isArray: true });
			} else if (char === "]" && paths[paths.length - 1].isArray) {
				// do nothing
			} else {
				const path = paths[paths.length - 1];
				path.member += char;
			}
		}

		let scope: Indexable = item;

		let nextMember = paths[1];
		for (let index = 0; index < paths.length; index++, nextMember = paths[index + 1]) {
			const path = paths[index];

			if (path) {
				if (index === paths.length - 1) {
					//at end of path. set value here
					scope[path.member] = val;
				} else {
					if (!scope[path.member]) {
						if (nextMember.isArray) {
							scope[path.member] = [];
						} else {
							scope[path.member] = {};
						}
					} else if (pure) {
						if (Array.isArray(scope[path.member])) {
							scope[path.member] = scope[path.member].slice();
						} else if (typeof scope[path.member] === "object") {
							scope[path.member] = { ...scope[path.member] };
						}
					}

					scope = scope[path.member];
				}
			}
		}

		return item;
	}
}

type Path = {
	member: string;
	isArray: boolean;
};
