import { SCHEMA_URL } from './config'
import { SchemaStatus, useFormSchema } from './hooks/useFormSchema'
import { FormWidget } from './ui/FormWidget'
import { ErrorScreen, LoadingScreen } from './ui/screens'

function App() {
  const { state, retry } = useFormSchema(SCHEMA_URL)

  switch (state.status) {
    case SchemaStatus.Loading:
      return <LoadingScreen />
    case SchemaStatus.Error:
      return <ErrorScreen message={state.message} onRetry={retry} />
    case SchemaStatus.Ready:
      return <FormWidget schema={state.schema} />
  }
}

export default App
