import type { FormValues, Field, Step, ValidationRule } from '../schema/types'

export type StepErrors = Record<string, string>

export function validateStep(step: Step, values: Partial<FormValues>, today = new Date()): StepErrors {
  const errors: StepErrors = {}
  for (const field of step.fields) {
    const message = validateField(field, values[field.name] ?? '', today)
    if (message) errors[field.name] = message
  }
  return errors
}

const isBlank = (value: string) => value.trim() === ''
const isRequiredRule = (rule: ValidationRule) => rule.type === 'required'

export function validateField(field: Field, value: string, today = new Date()): string | undefined {
  const rules = isBlank(value) ? field.validation.filter(isRequiredRule) : field.validation
  return rules.find((rule) => !passes(rule, value, today))?.message
}

function passes(rule: ValidationRule, value: string, today: Date): boolean {
  switch (rule.type) {
    case 'required':
      return !isBlank(value)
    case 'min_length':
      return value.length >= rule.value
    case 'max_length':
      return value.length <= rule.value
    case 'pattern':
      return new RegExp(rule.value).test(value)
    case 'min_age':
      return isAtLeastYearsOld(value, rule.value, today)
  }
}

interface CalendarDate {
  year: number
  month: number
  day: number
}

export function isAtLeastYearsOld(isoDate: string, years: number, today: Date): boolean {
  const birthday = parseCalendarDate(isoDate)
  if (!birthday) return false
  const comingOfAge = { ...birthday, year: birthday.year + years }
  return isOnOrBefore(comingOfAge, toCalendarDate(today))
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

function parseCalendarDate(isoDate: string): CalendarDate | undefined {
  const match = ISO_DATE.exec(isoDate)
  if (!match) return undefined
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
}

function toCalendarDate(date: Date): CalendarDate {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
}

function isOnOrBefore(a: CalendarDate, b: CalendarDate): boolean {
  if (a.year !== b.year) return a.year < b.year
  if (a.month !== b.month) return a.month < b.month
  return a.day <= b.day
}
