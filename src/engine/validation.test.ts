import { describe, expect, it } from 'vitest'
import type { Field, Step, ValidationRule } from '../schema/types'
import { isAtLeastYearsOld, validateField, validateStep } from './validation'

const textField = (validation: ValidationRule[]): Field => ({
  name: 'name',
  label: 'Name',
  component: 'text',
  validation,
})

const required: ValidationRule = { type: 'required', message: 'Required' }
const minLength: ValidationRule = { type: 'min_length', value: 2, message: 'Too short' }
const maxLength: ValidationRule = { type: 'max_length', value: 4, message: 'Too long' }
const digits: ValidationRule = { type: 'pattern', value: '^\\d+$', message: 'Digits only' }

const today = new Date('2026-09-11T12:00:00')

describe('validateField', () => {
  it('returns the first failing message in schema order', () => {
    const field = textField([required, minLength, digits])
    expect(validateField(field, '')).toBe('Required')
    expect(validateField(field, 'a')).toBe('Too short')
    expect(validateField(field, 'ab')).toBe('Digits only')
    expect(validateField(field, '12')).toBeUndefined()
  })

  it('treats whitespace as empty for required', () => {
    expect(validateField(textField([required]), '   ')).toBe('Required')
  })

  it('lets an optional field stay empty', () => {
    expect(validateField(textField([minLength, digits]), '')).toBeUndefined()
  })

  it('checks max_length', () => {
    expect(validateField(textField([maxLength]), '12345')).toBe('Too long')
    expect(validateField(textField([maxLength]), '1234')).toBeUndefined()
  })
})

describe('isAtLeastYearsOld', () => {
  it.each([
    ['18th birthday is today', '2008-09-11', true],
    ['18th birthday is tomorrow', '2008-09-12', false],
    ['18th birthday was yesterday', '2008-09-10', true],
    ['18th birthday is next month', '2008-10-01', false],
    ['born at the end of the previous year', '2007-12-31', true],
    ['leap-day birthday, 18 since 1 March', '2008-02-29', true],
    ['born today', '2026-09-11', false],
    ['not an ISO date', '11/09/2008', false],
    ['empty', '', false],
  ])('%s', (_, dateOfBirth, expected) => {
    expect(isAtLeastYearsOld(dateOfBirth, 18, today)).toBe(expected)
  })
})

describe('validateStep', () => {
  const step: Step = {
    id: 'details',
    title: 'Details',
    fields: [
      textField([required]),
      {
        name: 'date_of_birth',
        label: 'Date of birth',
        component: 'date',
        validation: [required, { type: 'min_age', value: 18, message: 'Too young' }],
      },
    ],
  }

  it('collects messages by field name and treats missing values as empty', () => {
    expect(validateStep(step, { date_of_birth: '2020-01-01' }, today)).toEqual({
      name: 'Required',
      date_of_birth: 'Too young',
    })
  })

  it('returns an empty object for a valid step', () => {
    expect(validateStep(step, { name: 'Ada', date_of_birth: '1990-01-01' }, today)).toEqual({})
  })
})
