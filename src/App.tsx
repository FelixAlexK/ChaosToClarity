import type { ToastT } from 'sonner'
import { SyncProvider } from '@synckit-js/sdk'
import { useState } from 'react'
import { toast } from 'sonner'
import { InitSyncKit } from './hooks/useSyncKit'
import { BaseLayout } from './layouts/baseLayout'
import { MainPage } from './pages/mainPage'

function App() {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ message: string, type: Exclude<ToastT['type'], 'error'> } | null>(null)
  const { synckit } = InitSyncKit({ setError, setMessage })

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
