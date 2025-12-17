import { SyncProvider } from '@synckit-js/sdk'
import { useInitSyncKit } from './hooks/useSyncKit'
import { toast, type ToastT } from 'sonner'
import { BaseLayout } from './layouts/baseLayout'
import { MainPage } from './pages/mainPage'
import { useState } from 'react'


function App() {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ message: string, type: Omit<ToastT['type'], 'error'> } | null>(null)
  const { synckit } = useInitSyncKit({ setError, setMessage })

  if (error) {
    toast.error(`Failed to initialize SyncKit: ${error}`)
    return null
  }

  if (!synckit) {
    toast.loading(`${message ? message.message : 'Initializing SyncKit...'}`)
    return null
  }

  return (
    <SyncProvider synckit={synckit}>
      <BaseLayout>
        <MainPage />
      </BaseLayout>
    </SyncProvider>
  )
}

export default App
