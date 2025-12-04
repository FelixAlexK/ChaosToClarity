import type { JSX } from 'react'
import type z from 'zod'
import type { responseSchema, storageSchema } from '@/types/ai'
import { useSyncDocument } from '@synckit-js/sdk'
import { se } from 'date-fns/locale'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { sendBrainDumpToGemini } from '@/services/gemini'
import { BrainDumpInput } from './BrainDumpInput'
import { Calendar } from './Calendar'
import { CalendarDayHeader } from './CalendarDayHeader'
import { ModeToggle } from './ModeToggle'
import { TaskCard } from './TaskCard'

const DOCUMENT_ID = import.meta.env.VITE_DOCUMENT_ID as string || 'ctc-id'

type StorageDocument = z.infer<typeof storageSchema>
type AIResponse = z.infer<typeof responseSchema>
type Task = z.infer<typeof storageSchema>['tasks'][number]

export default function ChaosToClarityApp() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [yearAndMonth, setYearAndMonth] = useState([new Date().getFullYear(), new Date().getMonth() + 1])
  const [error, setError] = useState<string | null>(null)
  const hasInitialized = useRef(false)

  // Use SyncKit's React hook - this persists automatically
  const [document, { update: updateDocument, set: setDocument }] = useSyncDocument<StorageDocument>(DOCUMENT_ID)

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
  })

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

  // Show loading state while document initializes
  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error) {
    toast.error(`${error}`)
    setError(null)
  }

  return (
    <>
      <header className="w-full max-w-4xl flex justify-center mx-auto p-1 md:px-4 pt-8">
        <div className="flex justify-between items-center w-full">
          <h1 className="flex justify-center w-full text-xl font-bold">Chaos to Clarity</h1>
          <ModeToggle />
        </div>
      </header>

      <div className="w-full max-w-4xl space-y-4 mx-auto p-1 md:px-4 pb-8">
        <BrainDumpInput onSubmit={handleBrainDumpSubmit} isProcessing={isProcessing} />

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl">
          {document.tasks?.map((task, index) => (
            <TaskCard updateTask={task => handleTaskUpdate(task)} key={task.id || index} task={task} />
          ))}
        </div>

        <div>
          {document.weeklyPlan?.plan && (
            <Calendar
              onYearAndMonthChange={setYearAndMonth}
              yearAndMonth={yearAndMonth}
              renderDay={day => (
                <CalendarDayHeader
                  weeklyPlan={document.weeklyPlan.plan}
                  calendarDayObject={day}
                />
              )}
            />
          )}
        </div>
      </div>
    </>
  )
}
