import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FormValues } from '../schema/types'

const STORAGE_KEY = 'react-form-widget'

interface FormSession {
  formId: string | null
  stepIndex: number
  values: FormValues
  startSession(form: { formId: string; stepCount: number }): void
  saveValues(values: FormValues): void
  goToStep(index: number): void
  reset(): void
}

export const useFormSession = create<FormSession>()(
  persist(
    (set) => ({
      formId: null,
      stepIndex: 0,
      values: {},
      startSession: ({ formId, stepCount }) =>
        set((state) =>
          state.formId === formId
            ? { stepIndex: Math.min(state.stepIndex, stepCount - 1) }
            : { formId, stepIndex: 0, values: {} },
        ),
      saveValues: (values) => set((state) => ({ values: { ...state.values, ...values } })),
      goToStep: (stepIndex) => set({ stepIndex }),
      reset: () => set({ stepIndex: 0, values: {} }),
    }),
    {
      name: STORAGE_KEY,
      partialize: ({ formId, stepIndex, values }) => ({ formId, stepIndex, values }),
    },
  ),
)
