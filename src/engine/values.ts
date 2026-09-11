import type { FormValues, Field } from '../schema/types'

export function valuesForFields(fields: Field[], source: Partial<FormValues>): FormValues {
  return Object.fromEntries(fields.map((field) => [field.name, source[field.name] ?? '']))
}
