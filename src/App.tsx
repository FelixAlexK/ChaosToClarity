import { SyncKit, SyncProvider } from '@synckit-js/sdk'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BaseLayout } from './layouts/baseLayout'
import { MainPage } from './pages/mainPage'

const sync = new SyncKit({
  storage: 'indexeddb',
})

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

    initSyncKit()
  }, [])

  if (error) {
    toast.error(`Failed to initialize SyncKit: ${error}`)
    return
  }

  if (!synckit) {
    toast.loading(`Syncing...`)
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
