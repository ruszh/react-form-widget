import type {
  Field,
  FieldComponent,
  FormSchema,
  Option,
  RuleType,
  Step,
  ValidationRule,
} from './types'

const FIELD_COMPONENTS: Record<FieldComponent, true> = {
  text: true,
  email: true,
  tel: true,
  date: true,
  select: true,
  choice: true,
}
const RULE_TYPES: Record<RuleType, true> = {
  required: true,
  min_length: true,
  max_length: true,
  pattern: true,
  min_age: true,
}

export function parseFormSchema(input: unknown): FormSchema {
  const root = requireObject(input, 'schema')
  const steps = requireArray(root.steps, 'schema.steps').map(parseStep)
  if (steps.length === 0) throw new Error('schema has no steps')

  const seen = new Set<string>()
  for (const field of steps.flatMap((step) => step.fields)) {
    if (seen.has(field.name)) throw new Error(`duplicate field name "${field.name}"`)
    seen.add(field.name)
  }

  return {
    id: requireString(root.id, 'schema.id'),
    title: requireString(root.title, 'schema.title'),
    steps,
  }
}

function parseStep(value: unknown, index: number): Step {
  const path = `steps[${index}]`
  const step = requireObject(value, path)
  return {
    id: requireString(step.id, `${path}.id`),
    title: requireString(step.title, `${path}.title`),
    fields: requireArray(step.fields, `${path}.fields`).map((field, i) =>
      parseField(field, `${path}.fields[${i}]`),
    ),
  }
}

function parseField(value: unknown, path: string): Field {
  const field = requireObject(value, path)
  const component = requireString(field.component, `${path}.component`)
  if (!isFieldComponent(component)) {
    throw new Error(`${path}.component: unsupported field type "${component}"`)
  }

  const base = {
    name: requireString(field.name, `${path}.name`),
    label: requireString(field.label, `${path}.label`),
    hint: optionalString(field.hint, `${path}.hint`),
    validation: requireArray(field.validation, `${path}.validation`).map((rule, i) =>
      parseRule(rule, `${path}.validation[${i}]`),
    ),
  }

  switch (component) {
    case 'text':
    case 'email':
    case 'tel':
      return { ...base, component, placeholder: optionalString(field.placeholder, `${path}.placeholder`) }
    case 'date':
      return { ...base, component }
    case 'select':
    case 'choice':
      return {
        ...base,
        component,
        options: requireArray(field.options, `${path}.options`).map((option, i) =>
          parseOption(option, `${path}.options[${i}]`),
        ),
      }
  }
}

function parseRule(value: unknown, path: string): ValidationRule {
  const rule = requireObject(value, path)
  const type = requireString(rule.type, `${path}.type`)
  if (!isRuleType(type)) throw new Error(`${path}.type: unsupported validation rule "${type}"`)
  const message = requireString(rule.message, `${path}.message`)

  switch (type) {
    case 'required':
      return { type, message }
    case 'min_length':
    case 'max_length':
    case 'min_age':
      return { type, message, value: requireNumber(rule.value, `${path}.value`) }
    case 'pattern': {
      const pattern = requireString(rule.value, `${path}.value`)
      try {
        new RegExp(pattern)
      } catch {
        throw new Error(`${path}.value: invalid regular expression`)
      }
      return { type, message, value: pattern }
    }
  }
}

function parseOption(value: unknown, path: string): Option {
  const option = requireObject(value, path)
  return {
    label: requireString(option.label, `${path}.label`),
    value: requireString(option.value, `${path}.value`),
  }
}

const isFieldComponent = (value: string): value is FieldComponent =>
  Object.hasOwn(FIELD_COMPONENTS, value)
const isRuleType = (value: string): value is RuleType => Object.hasOwn(RULE_TYPES, value)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function requireObject(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${path} must be an object`)
  return value
}

function requireArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`)
  return value
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== 'string') throw new Error(`${path} must be a string`)
  return value
}

function optionalString(value: unknown, path: string): string | undefined {
  return value === undefined ? undefined : requireString(value, path)
}

function requireNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${path} must be a number`)
  }
  return value
}
