# react-modular-form

A simple yet powerful react form library that is easily extendable and promotes reusability

![Bundlephobia gzip + minified](https://badgen.net/bundlephobia/minzip/react-modular-form)

`yarn add react-modular-form`

`npm install react-modular-form`


## Why use React Modular Form?
RMF has first class typescript integration via "typed pathing". Other form libs on the internet assign field values with a magic string making
refactoring a nightmare. RMF uses `TypedPath<T>` in the `Field`'s `path` prop, to generate a type safe compiler aware string that can be refactored seamlessly.

RMF also exposes the underlying storage provider as `IFormStateProvider` meaning you can integrate the form state with any provider, such as Redux or `localStorage`.

### What if im not using Typescript?
You can still use the `form.paths` object in JS however you will not get type safety or mass rename functionality. The `path` prop can also take a magic string value, in lieu of a `TypedPath`.

## Example

*Login.tsx*

```tsx
<Form<LoginDto> classes={styles}>
   {form =>
      <React.Fragment>
         <div styleName="login-content">
            <div styleName="login-title">Login</div>
            <Field
               path={form.paths.email}
               validation={[FormValidators.required, FormValidators.isEmail]}
               component={RenderInput}
               styleName="text-input"
               componentProps={{
                  placeholder: "Email"
               }} />
         </div>
         <div styleName="login-footer">
            <Button theme="outline" onClick={() => form.handleSubmit(data => this.doLogin(data))}>
               Login
            </Button>
         </div>
      </React.Fragment>
   }
</Form>
```

*RenderInput.tsx*

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
         <FormFieldCommonBase
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
         </FormFieldCommonBase>
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


Alternatively, you may decorate your class component with `@FormFactory(FormPropsConfig<TFormValue>)` to inject the `InjectedForm` values as props accessible to 
the entire class.

## react-css-modules

RMF has built in support for `react-css-modules`. Simply pass your classes object to the `classes` prop on `Form`
```tsx
<Form<LoginDto> classes={styles}>
```

## Exports

 Component | Description
 --- | ---
 `Field` | Represents an input component via prop `component={...}` and stores the value at `path`.
 `FieldArray` | Denotes an array field. Takes a single function as child that must return a `React.ReactNode`.
 `Form` | The root form component. These can be nested but cannot interact with each other.
 `FormFactory` | A decorator to wrap a class component with `Form`.
 `IFieldFormatter` | Interface to define a field formatter. Field formatters mutate the data passed between `Field` <--> state.
 `IFormStateProvider` | Interface to define a custom state provider. Custom state providers are passed to `Form` or `FormFactory`.
 `InjectedField`| Props injected into field components.
 `InjectedFieldArray` | Props injected into field array components.
 `InjectedForm` | Props injected by `FormFactory`.
 `FormValidators` | Built in field validators. Custom validators can be defined and passed to the `validation` props as a single argument or an array of validators.