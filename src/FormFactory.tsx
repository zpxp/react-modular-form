import * as React from "react";
import { ReactComponent } from "z-types";
import { FormPropsConfig, Form } from "./Form";

function FormFactoryImpl<TFormValue extends object>(Component: ReactComponent<any>, config: FormPropsConfig<TFormValue>) {
	class FormFactory extends React.PureComponent<
		{ classes?: object; __internal_ref: React.Ref<any> },
		{ wrapped: typeof React.Component; merged: {} }
	> {
		static __FORM_FACTORY = true;

		render() {
			const { __internal_ref, ...props } = this.props;
			return (
				<Form<TFormValue> {...config} {...props}>
					{form => {
						return <Component {...form} {...props} ref={__internal_ref} />;
					}}
				</Form>
			);
		}
	}

	return React.forwardRef((props, ref) => <FormFactory {...props} __internal_ref={ref} />);
}

/**
 * Inject form context into the props of decorated component
 */
export function FormFactory<P, TFormValue extends object>(config?: FormPropsConfig<TFormValue>) {
	return function <T = ReactComponent<P>>(component: T): T {
		return (FormFactoryImpl(component as any, config) as any) as T;
	};
}
