import styles from './FieldRenderer.module.css'
import type { FieldControlProps } from './registry'

export function TextControl({
  field,
  register,
  controlId,
  describedBy,
  invalid,
}: FieldControlProps<'text' | 'email' | 'tel'>) {
  return (
    <>
      <label htmlFor={controlId} className={styles.label}>
        {field.label}
      </label>
      <input
        id={controlId}
        type={field.component}
        placeholder={field.placeholder}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        className={styles.input}
        {...register(field.name)}
      />
    </>
  )
}

export function DateControl({ field, register, controlId, describedBy, invalid }: FieldControlProps<'date'>) {
  return (
    <>
      <label htmlFor={controlId} className={styles.label}>
        {field.label}
      </label>
      <input
        id={controlId}
        type="date"
        aria-describedby={describedBy}
        aria-invalid={invalid}
        className={styles.input}
        {...register(field.name)}
      />
    </>
  )
}

export function SelectControl({ field, register, controlId, describedBy, invalid }: FieldControlProps<'select'>) {
  return (
    <>
      <label htmlFor={controlId} className={styles.label}>
        {field.label}
      </label>
      <select
        id={controlId}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        className={styles.input}
        {...register(field.name)}
      >
        <option value="">Select…</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  )
}

export function ChoiceControl({ field, register, controlId, describedBy }: FieldControlProps<'choice'>) {
  return (
    <fieldset id={controlId} aria-describedby={describedBy} className={styles.group}>
      <legend className={styles.label}>{field.label}</legend>
      {field.options.map((option) => (
        <label key={option.value} className={styles.option}>
          <input type="radio" value={option.value} {...register(field.name)} />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}
