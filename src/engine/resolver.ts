import type { Resolver } from 'react-hook-form'
import type { FormValues, Step } from '../schema/types'
import { valuesForFields } from './values'
import { validateStep } from './validation'

export function createStepResolver(step: Step): Resolver<FormValues> {
  return (values) => {
    const stepValues = valuesForFields(step.fields, values)
    const messages = validateStep(step, stepValues)
    const errors = Object.fromEntries(
      Object.entries(messages).map(([name, message]) => [name, { type: 'schema', message }]),
    )
    return Object.keys(errors).length === 0 ? { values: stepValues, errors: {} } : { values: {}, errors }
  }
}
