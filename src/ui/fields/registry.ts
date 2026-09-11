import type { ComponentType } from 'react'
import type { UseFormRegister } from 'react-hook-form'
import type { FormValues, FieldByComponent, FieldComponent } from '../../schema/types'
import { ChoiceControl, DateControl, SelectControl, TextControl } from './controls'

export interface FieldControlProps<K extends FieldComponent> {
  field: FieldByComponent[K]
  register: UseFormRegister<FormValues>
  controlId: string
  describedBy?: string
  invalid: boolean
}

export const fieldControls: { [K in FieldComponent]: ComponentType<FieldControlProps<K>> } = {
  text: TextControl,
  email: TextControl,
  tel: TextControl,
  date: DateControl,
  select: SelectControl,
  choice: ChoiceControl,
}
