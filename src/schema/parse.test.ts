import { describe, expect, it } from 'vitest'
import { parseFormSchema } from './parse'

const textField = {
  name: 'first_name',
  label: 'First name',
  component: 'text',
  placeholder: 'John',
  validation: [
    { type: 'required', message: 'Required' },
    { type: 'min_length', value: 2, message: 'Too short' },
  ],
}

const choiceField = {
  name: 'reason',
  label: 'Reason',
  component: 'choice',
  options: [{ label: 'Bills', value: 'bills' }],
  validation: [],
}

const schema = {
  id: 'test-form',
  title: 'Test',
  steps: [{ id: 'one', title: 'Step one', fields: [textField, choiceField] }],
}

const withFields = (...fields: unknown[]) => ({
  ...schema,
  steps: [{ ...schema.steps[0], fields }],
})

describe('parseFormSchema', () => {
  it('accepts a well-formed schema unchanged', () => {
    expect(parseFormSchema(schema)).toEqual(schema)
  })

  it.each([
    ['an unknown component', { ...textField, component: 'checkbox' }, 'unsupported field type "checkbox"'],
    ['an unknown rule', { ...textField, validation: [{ type: 'max', value: 1, message: 'x' }] }, 'unsupported validation rule "max"'],
    ['an invalid pattern', { ...textField, validation: [{ type: 'pattern', value: '[', message: 'x' }] }, 'invalid regular expression'],
    ['a rule without a message', { ...textField, validation: [{ type: 'required' }] }, 'validation[0].message must be a string'],
    ['a select without options', { ...textField, component: 'select' }, 'options must be an array'],
    ['a field without a name', { ...textField, name: undefined }, 'name must be a string'],
  ])('rejects %s', (_, field, message) => {
    expect(() => parseFormSchema(withFields(field))).toThrow(message)
  })

  it('rejects a schema without steps', () => {
    expect(() => parseFormSchema({ ...schema, steps: [] })).toThrow('no steps')
  })

  it('rejects duplicate field names across steps', () => {
    expect(() => parseFormSchema(withFields(textField, textField))).toThrow('duplicate field name')
  })

  it('rejects non-object input', () => {
    expect(() => parseFormSchema('nope')).toThrow('schema must be an object')
  })
})
