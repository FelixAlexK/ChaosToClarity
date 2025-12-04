import { SyncKit, SyncProvider } from '@synckit-js/sdk'
import { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import ChaosToClarityApp from './components/ChaosToClarityApp'
import { ModeToggle } from './components/ModeToggle'
import { ThemeProvider } from './components/themeProvider'

function App() {
  const [synckit, setSynckit] = useState<SyncKit | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initSyncKit = async () => {
      try {
        const sync = new SyncKit({
          storage: 'indexeddb',
          name: 'chaos-to-clarity-db',
        })

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

      <ChaosToClarityApp></ChaosToClarityApp>
      {/* <Toaster position="top-center" /> */}

    </SyncProvider>

  )
}

export default App
