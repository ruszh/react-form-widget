import { useEffect, useState } from 'react'
import { fetchFormSchema } from '../api'
import { parseFormSchema } from '../schema/parse'
import type { FormSchema } from '../schema/types'
import { useFormSession } from '../store/formSession'

export enum SchemaStatus {
  Loading = 'loading',
  Error = 'error',
  Ready = 'ready',
}

export type SchemaState =
  | { status: SchemaStatus.Loading }
  | { status: SchemaStatus.Error; message: string }
  | { status: SchemaStatus.Ready; schema: FormSchema }

export function useFormSchema(url: string) {
  const [state, setState] = useState<SchemaState>({ status: SchemaStatus.Loading })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchFormSchema(url, controller.signal)
      .then((json) => {
        const schema = parseFormSchema(json)
        useFormSession.getState().startSession({ formId: schema.id, stepCount: schema.steps.length })
        setState({ status: SchemaStatus.Ready, schema })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: SchemaStatus.Error, message: error instanceof Error ? error.message : 'Unknown error' })
      })
    return () => controller.abort()
  }, [url, attempt])

  const retry = () => {
    setState({ status: SchemaStatus.Loading })
    setAttempt((n) => n + 1)
  }

  return { state, retry }
}
