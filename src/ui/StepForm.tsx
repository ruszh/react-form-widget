import { useForm } from 'react-hook-form'
import { valuesForFields } from '../engine/values'
import { createStepResolver } from '../engine/resolver'
import type { FormValues, Step } from '../schema/types'
import { FieldRenderer } from './fields/FieldRenderer'
import styles from './FormWidget.module.css'

interface StepFormProps {
  step: Step
  values: FormValues
  isFirst: boolean
  isLast: boolean
  onBack: (draft: FormValues) => void
  onNext: (values: FormValues) => void
}

export function StepForm({ step, values, isFirst, isLast, onBack, onNext }: StepFormProps) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: valuesForFields(step.fields, values),
    resolver: createStepResolver(step),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  return (
    <form noValidate onSubmit={handleSubmit(onNext)} className={styles.form}>
      {step.fields.map((field) => (
        <FieldRenderer key={field.name} field={field} register={register} error={errors[field.name]?.message} />
      ))}
      <div className={styles.actions}>
        {!isFirst && (
          <button type="button" onClick={() => onBack(getValues())}>
            Back
          </button>
        )}
        <button type="submit">{isLast ? 'Submit' : 'Next'}</button>
      </div>
    </form>
  )
}
