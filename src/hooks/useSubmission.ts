import { useCallback, useRef, useState } from 'react'
import { submitValues } from '../api'
import { SUBMIT_URL } from '../config'
import type { FormValues } from '../schema/types'
import { useFormSession } from '../store/formSession'

export enum SubmissionStatus {
  Idle = 'idle',
  Pending = 'pending',
  Success = 'success',
  Error = 'error',
}

type SubmissionState = { status: SubmissionStatus; message?: string }

export function useSubmission() {
  const [state, setState] = useState<SubmissionState>({ status: SubmissionStatus.Idle })
  const inFlight = useRef(false)

  const submit = useCallback(async (values: FormValues) => {
    if (inFlight.current) return
    inFlight.current = true
    setState({ status: SubmissionStatus.Pending })
    try {
      await submitValues(SUBMIT_URL, values)
      useFormSession.getState().reset()
      setState({ status: SubmissionStatus.Success })
    } catch (error: unknown) {
      setState({
        status: SubmissionStatus.Error,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      inFlight.current = false
    }
  }, [])

  const reset = useCallback(() => setState({ status: SubmissionStatus.Idle }), [])

  return { ...state, submit, reset }
}
