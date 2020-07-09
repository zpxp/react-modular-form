import * as React from "react";
import CSSModules from "react-css-modules";
import { ReactComponent } from "./types";

function MergeStylesImpl(component: ReactComponent<any>, styles: object) {
	class StylesMerged extends React.PureComponent<
		{ classes?: object; __internal_ref: React.Ref<any> },
		{ wrapped: typeof React.Component; merged: {} }
	> {
		static __MERGE_STYLES_ = true;

		constructor(props: { classes?: object; __internal_ref: React.Ref<any> }) {
			super(props);
			const merged = { ...styles, ...this.props.classes };

			this.state = {
				wrapped: CSSModules(component, merged, { allowMultiple: true }),
				merged
			};
		}

		render() {
			const Elem = this.state.wrapped;
			const { __internal_ref, ...props } = this.props;
			// add styles onto here so it exists in the ctor. cssmodules only adds it to props in render
			return <Elem {...props} styles={this.state.merged} ref={__internal_ref} />;
		}
	}

	return React.forwardRef((props, ref) => <StylesMerged {...props} __internal_ref={ref} />);
}

/**
 * Extract consumer css from styles and merge into base css.
 */
export function MergeStyles(styles: object) {
	return function <P, T = ReactComponent<P>>(component: T): T {
		return (MergeStylesImpl(component as any, styles) as any) as T;
	};
}
