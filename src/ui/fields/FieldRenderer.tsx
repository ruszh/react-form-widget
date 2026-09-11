import { useId, type ComponentType } from 'react'
import type { UseFormRegister } from 'react-hook-form'
import type { FormValues, FieldByComponent, FieldComponent } from '../../schema/types'
import styles from './FieldRenderer.module.css'
import { fieldControls, type FieldControlProps } from './registry'

interface FieldRendererProps<K extends FieldComponent> {
  field: FieldByComponent[K]
  register: UseFormRegister<FormValues>
  error?: string
}

export function FieldRenderer<K extends FieldComponent>({ field, register, error }: FieldRendererProps<K>) {
  const id = useId()
  const hintId = field.hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const Control: ComponentType<FieldControlProps<K>> = fieldControls[field.component]

  return (
    <div className={styles.field}>
      <Control
        field={field}
        register={register}
        controlId={id}
        describedBy={describedBy}
        invalid={error !== undefined}
      />
      {field.hint && (
        <p id={hintId} className={styles.hint}>
          {field.hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
