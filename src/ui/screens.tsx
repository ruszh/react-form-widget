import styles from './screens.module.css'

export function LoadingScreen() {
  return (
    <p className={styles.screen} role="status">
      Loading form…
    </p>
  )
}

export function PendingScreen() {
  return (
    <p className={styles.screen} role="status">
      Submitting your answers…
    </p>
  )
}

interface ErrorScreenProps {
  message: string
  onRetry: () => void
  onBackToForm?: () => void
}

export function ErrorScreen({ message, onRetry, onBackToForm }: ErrorScreenProps) {
  return (
    <div className={styles.screen} role="alert">
      <p>{message}</p>
      <div className={styles.actions}>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
        {onBackToForm && (
          <button type="button" onClick={onBackToForm}>
            Back to form
          </button>
        )}
      </div>
    </div>
  )
}

export function SuccessScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className={styles.screen}>
      <p>Thank you, your request has been sent.</p>
      <button type="button" onClick={onRestart}>
        Start a new form
      </button>
    </div>
  )
}
