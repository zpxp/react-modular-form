# react-modular-form

A simple yet powerful react form library that is easily extendable and promotes reusability

![Bundlephobia gzip + minified](https://badgen.net/bundlephobia/minzip/react-modular-form)

`yarn add react-modular-form`

`npm install react-modular-form`

### Example

```tsx
<Form<BoardDto> classes={styles}>
   {form =>
      <React.Fragment>
         <div styleName="new-project-content">
            <div styleName="new-project-title">New Board</div>
            <Field
               path={form.paths.name}
               validation={FormValidators.required}
               component={RenderInput}
               styleName="text-input"
               componentProps={{
                  placeholder: "Board Name"
               }} />
         </div>
         <div styleName="new-project-footer">
            <Button theme="outline" onClick={() => form.handleSubmit(data => this.handleSubmit(data))}>
               Create
            </Button>
         </div>
      </React.Fragment>
   }
</Form>
```

RenderInput.tsx

```tsx
export class RenderInput extends React.PureComponent<InjectedField<string | number, RenderInputProps>> {
	static defaultProps: Partial<RenderInputProps> = {
		inputClass: "",
		align: "center"
	};
	inputRef: React.RefObject<HTMLInputElement>;

	constructor(props: InjectedField<string | number, RenderInputProps>) {
		super(props);
		this.inputRef = React.createRef<HTMLInputElement>();
	}

	componentDidMount() {
		if (this.props.autoFocus && this.inputRef.current) {
			this.inputRef.current.focus();
		}
	}

	render() {
		//is single field
		const props = this.props;
		const { inputClass, secure, align, autoFocus, required, classes, label, defaultValue, ...compProps } = props.componentProps();

		return (
			<FormFieldBase
				className={compProps.className}
				label={label}
				error={this.props.form.field.error}
				touched={this.props.form.field.touched}
				required={required}
				type="forminput"
			>
				<input
					size={1}
					styleName={`input-class ${inputClass}`}
					{...compProps}
					{...props.fieldProps}
					value={props.fieldProps.value === null || props.fieldProps.value === undefined ? "" : props.fieldProps.value}
					disabled={compProps.disabled}
					ref={this.inputRef}
					align={props.align}
					onChange={e => {
						if (compProps.type === "number") {
							const num = parseFloat(e.target.value);
							props.fieldProps.onChange(!isNaN(num) ? num : null);
						} else {
							props.fieldProps.onChange(e.target.value);
						}
					}}
					type={secure ? "password" : compProps.type || "text"}
				/>
			</FormFieldBase>
		);
	}
}

export interface RenderInputProps extends CommonComponentProps, React.InputHTMLAttributes<HTMLInputElement> {
	//single fields
	secure?: boolean;
	label?: string;
	inputClass?: string;
	disabled?: boolean;
	required?: boolean;
	autoFocus?: boolean;
	align?: "left" | "center" | "right";
}
```
