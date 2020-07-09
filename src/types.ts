export type Indexable<T = any> = { [x: string]: T; [x: number]: T };
/**  Select all props in T that are not in K object	*/
export type OmitUnion<T, K> = Pick<T, Exclude<keyof T, keyof K>>;

/**  Select all props in T that are not named 	*/
export type OmitName<T, K> = Pick<T, Exclude<keyof T, K>>;
export type ReactComponent<P = any, S = any> = new (props: P, context?: any) => React.Component<P, S>;
export interface CommonComponentProps {
	className?: string;
	styleName?: string;
	classes?: object;
}