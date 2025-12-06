import { SyncKit, SyncProvider } from '@synckit-js/sdk'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BaseLayout } from './layouts/baseLayout'
import { MainPage } from './pages/mainPage'

const sync = new SyncKit({
  storage: 'indexeddb',
})

let didInit = false

function App() {
  const [synckit, setSynckit] = useState<SyncKit | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initSyncKit = async () => {
      try {
        await sync.init()
        setSynckit(sync)
      }
      catch (err) {
        console.error('Failed to initialize SyncKit:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    if (!didInit) {
      initSyncKit()
      didInit = true
    }
  }, [])

  if (error) {
    toast.error(`Failed to initialize SyncKit: ${error}`)
    return
  }

  if (!synckit) {
    toast.loading(`Initializing...`)
    return
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
