import type { StorageDocument, Task } from '@/types/ai'
import { useSyncDocument, useSyncKit } from '@synckit-js/sdk'
import { Calendar1, Grid2X2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Calendar } from '@/components/Calendar'
import { TaskCard } from '@/components/TaskCard'
import { Button } from '@/components/ui/button'
import { ToolLayout } from '@/layouts/toolLayout'
import { sendBrainDumpToGemini } from '@/services/gemini'
import { BrainDumpInput } from '../components/BrainDumpInput'
import { ModeToggle } from '../components/ModeToggle'
import { SettingsDropdown } from '../components/SettingsDropdown'

const DOCUMENT_ID = import.meta.env.VITE_DOCUMENT_ID as string || 'ctc-id'

export function MainPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toggleView, setToggleView] = useState(true)
  const hasInitialized = useRef(false)

  const sync = useSyncKit()

  // Use SyncKit's React hook - this persists automatically
  const [document, { update: updateDocument }] = useSyncDocument<StorageDocument>(DOCUMENT_ID)

  const syncState = sync.getSyncState(DOCUMENT_ID)

  useEffect(() => {
    if (!syncState)
      return

    toast.dismiss()
    if (syncState.state === 'syncing') {
      toast.loading('Syncing...')
    }
    else if (syncState.state === 'synced') {
      toast.success('Synced!')
    }
    else if (syncState.state === 'error') {
      toast.error('Sync failed')
    }
  }, [syncState])

  // Initialize document if it doesn't exist
  useEffect(() => {
    if (!document && !hasInitialized.current) {
      hasInitialized.current = true
      updateDocument({
        id: DOCUMENT_ID,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tasks: [],
        weeklyPlan: {
          id: '',
          plan: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
          },
        },
      })
    }
  }, [])

  const handleBrainDumpSubmit = async (content: string) => {
    if (!document)
      return

    try {
      setIsProcessing(true)

      const response = await sendBrainDumpToGemini(content)
      console.warn('AI Response:', response)

      // Create new tasks with IDs
      const newTasks = response.tasks.map(task => ({
        ...task,
        id: crypto.randomUUID(),
      }))

      // Merge weekly plan by appending to each day
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
      const mergedPlan = { ...document.weeklyPlan?.plan }

      days.forEach((day) => {
        if (response.weeklyPlan && response.weeklyPlan[day]) {
          mergedPlan[day] = [...(mergedPlan[day] || []), ...response.weeklyPlan[day]]
        }
      })

      updateDocument({
        ...document,
        tasks: [...(document.tasks || []), ...newTasks],
        weeklyPlan: {
          id: crypto.randomUUID(),
          plan: mergedPlan,
        },
        updatedAt: Date.now(),
      })

      toast.info('AI generated your weekly plan!')
    }
    catch (error) {
      console.error('Error processing brain dump:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      toast.error(errorMessage)
    }
    finally {
      setIsProcessing(false)
    }
  }

  const handleTaskUpdate = (task: Partial<Task>) => {
    if (!document) {
      setError('Document not loaded')
      return
    }

    if (!task.id) {
      setError('Task ID is missing')
      return
    }

    if (!document.tasks.find(t => t.id === task.id)) {
      setError('Task not found')
      return
    }

    if (Object.keys(task).length <= 1) {
      setError('No fields to update')
      return
    }

    // Update tasks array
    const updatedTasks = document.tasks.map(t => (t.id === task.id ? { ...t, ...task } : t))

    if (JSON.stringify(document.tasks.find(t => t.id === task.id)) === JSON.stringify(updatedTasks.find(t => t.id === task.id))) {
      toast.info('Task is unchanged, no updates made')
      return
    }

    updateDocument(
      {
        ...document,
        tasks: updatedTasks,
        updatedAt: Date.now(),
      },
    )

    toast.success('Task updated!')
  }

  const handleClearAllData = async () => {
    if (!document)
      return

    await sync.clearAll()

    toast.info('All data cleared.')
  }

  // Show loading state while document initializes
  if (!document) {
    toast.loading('Syncing data...')
  }

  if (error) {
    toast.error(`${error}`)
    setError(null)
  }

  return (
    <>
      <header className="mb-4 lg:mb-8 ">
        <div className="flex flex-row w-full justify-between items-center lg:mx-auto lg:max-w-4xl">
          <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">Chaos to Clarity</h1>
          <div className="flex gap-2 ">
            <Button variant="outline" onClick={() => setToggleView(!toggleView)}>{toggleView ? <Calendar1></Calendar1> : <Grid2X2></Grid2X2>}</Button>
            <ModeToggle />
            <SettingsDropdown clearAllData={handleClearAllData}></SettingsDropdown>
          </div>
        </div>
      </header>

      <ToolLayout>
        <div className="w-full lg:mx-auto lg:max-w-4xl  ">
          <BrainDumpInput onSubmit={handleBrainDumpSubmit} isProcessing={isProcessing} />
        </div>

        <div className="w-full lg:mx-auto lg:max-w-4xl  ">
          {toggleView
            ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
                  {document.tasks?.map((task, index) => (
                    <TaskCard
                      updateTask={handleTaskUpdate}
                      key={task.id || index}
                      task={task}
                    />
                  ))}
                </div>
              )
            : <Calendar weeklyPlan={document.weeklyPlan} />}
        </div>
      </ToolLayout>
    </>
  )
}
