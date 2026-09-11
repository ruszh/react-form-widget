import type { FormValues } from './schema/types'

export async function fetchFormSchema(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Could not load the form (HTTP ${response.status})`)
  return response.json()
}

export async function submitValues(url: string, values: FormValues): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
  if (!response.ok) throw new Error(`Submission failed (HTTP ${response.status})`)
}
