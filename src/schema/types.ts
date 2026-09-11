export interface Option {
  label: string
  value: string
}

export type ValidationRule =
  | { type: 'required'; message: string }
  | { type: 'min_length'; value: number; message: string }
  | { type: 'max_length'; value: number; message: string }
  | { type: 'pattern'; value: string; message: string }
  | { type: 'min_age'; value: number; message: string }

export type RuleType = ValidationRule['type']
export type RuleOf<T extends RuleType> = Extract<ValidationRule, { type: T }>

interface FieldBase {
  name: string
  label: string
  hint?: string
  validation: ValidationRule[]
}

interface TextExtras {
  placeholder?: string
}

interface FieldExtras {
  text: TextExtras
  email: TextExtras
  tel: TextExtras
  date: Record<never, never>
  select: { options: Option[] }
  choice: { options: Option[] }
}

export type FieldComponent = keyof FieldExtras

export type FieldByComponent = {
  [K in FieldComponent]: FieldBase & { component: K } & FieldExtras[K]
}

export type Field = FieldByComponent[FieldComponent]

export interface Step {
  id: string
  title: string
  fields: Field[]
}

export interface FormSchema {
  id: string
  title: string
  steps: Step[]
}

export type FormValues = Record<string, string>
