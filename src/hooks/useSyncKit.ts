import type { Dispatch, SetStateAction } from 'react'
import type { ToastT } from 'sonner'
import type { StorageDocumentV2, TaskV2 } from '@/types/ai_v2'
import { SyncKit, useSyncDocument } from '@synckit-js/sdk'
import { useEffect, useRef, useState } from 'react'
import { sendBrainDumpToGemini } from '@/services/gemini'

const DOCUMENT_ID = import.meta.env.VITE_DOCUMENT_ID as string || 'ctc-id'

type StatusMessage = { message: string, type: Exclude<ToastT['type'], 'error'> } | null
type SetMessage = Dispatch<SetStateAction<StatusMessage>>
type SetError = Dispatch<SetStateAction<string | null>>
type SetProcessing = Dispatch<SetStateAction<boolean>>

export interface UseSyncKitProps {
  setError: SetError
  setMessage: SetMessage
}

export interface UseTaskManagementHandlerProps extends UseSyncKitProps {
  document: StorageDocumentV2 | null
  updateDocument: (doc: Partial<StorageDocumentV2>) => void
  setIsProcessing: SetProcessing
}

export function InitSyncKit({ setError, setMessage }: UseSyncKitProps) {
  const [synckit, setSynckit] = useState<SyncKit | null>(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    const sync = new SyncKit({ storage: 'indexeddb' })

    const initSyncKit = async () => {
      try {
        await sync.init()
        if (isMounted.current) {
          setSynckit(sync)
        }

        if (sync.isInitialized() || synckit?.isInitialized()) {
          setMessage({ message: 'SyncKit initialized successfully', type: 'success' })
        }
      }
      catch (err) {
        console.error('Failed to initialize SyncKit:', err)
        setError('Failed to initialize SyncKit')
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      }
    }

    initSyncKit()

    return () => {
      isMounted.current = false
      // Dispose of sync if it has a dispose method
      if (typeof sync.dispose === 'function') {
        sync.dispose()
      }
    }
  }, [])

  return { synckit }
}

export function SyncKitDocument({ setMessage }: UseSyncKitProps) {
  const hasInitialized = useRef(false)
  const [document, { update: updateDocument }] = useSyncDocument<StorageDocumentV2>(DOCUMENT_ID)

  // Initialize document if it doesn't exist (only once)
  useEffect(() => {
    if (hasInitialized.current)
      return
    if (!document) {
      updateDocument({
        id: crypto.randomUUID(),
        tasks: [],
        weeklyPlan: {
          id: crypto.randomUUID(),
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      hasInitialized.current = true
      setMessage({ message: 'Initialized new document', type: 'success' })
    }
  }, [document, updateDocument])

  return { document, updateDocument }
}

export function TaskManagementHandlers({ document, updateDocument, setIsProcessing, setError, setMessage }: UseTaskManagementHandlerProps) {
  const handleBrainDumpSubmit = async (content: string) => {
    if (!document)
      return
    try {
      setIsProcessing(true)
      const response = await sendBrainDumpToGemini(content)
      console.warn('AI Response:', response)
      const newTasks = response.tasks.map(task => ({
        ...task,
        id: crypto.randomUUID(),
        color: undefined,
        completed: false,
      }))
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
      setMessage({
        message: 'Brain dump processed!',
        type: 'success',
      })
    }
    catch (error) {
      console.error('Error processing brain dump:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
    }
    finally {
      setIsProcessing(false)
    }
  }

  const handleTaskUpdate = (task: Partial<TaskV2>) => {
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
    const updatedTasks = document.tasks.map(t => (t.id === task.id ? { ...t, ...task } : t))
    if (JSON.stringify(document.tasks.find(t => t.id === task.id)) === JSON.stringify(updatedTasks.find(t => t.id === task.id))) {
      setMessage({ message: 'Task is unchanged, no updates made', type: 'info' })
      return
    }
    updateDocument({
      ...document,
      tasks: updatedTasks,
      updatedAt: Date.now(),
    })
    setMessage({ message: 'Task updated!', type: 'success' })
  }

  const handleClearAllData = async () => {
    if (!document)
      return
    updateDocument({
      ...document,
      tasks: [],
      weeklyPlan: {
        id: crypto.randomUUID(),
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
      updatedAt: Date.now(),
    })
    setMessage({ message: 'All data cleared.', type: 'info' })
  }

  const handleTaskDelete = async (id: string) => {
    if (!document) {
      setError('Document not loaded')
      return
    }
    const taskToDelete = document.tasks.find(t => t.id === id)
    if (!taskToDelete) {
      setError('Task not found')
      return
    }
    const updatedTasks = document.tasks.filter(t => t.id !== id)
    const originalPlan = document.weeklyPlan?.plan || {}
    const updatedWeeklyPlan: typeof originalPlan = { ...originalPlan }
    for (const [day, tasks] of Object.entries(updatedWeeklyPlan)) {
      updatedWeeklyPlan[day as keyof typeof updatedWeeklyPlan] = tasks.filter(task => task.task !== taskToDelete.title || task.end !== taskToDelete.deadline)
    }
    updateDocument({
      ...document,
      tasks: updatedTasks,
      weeklyPlan: {
        ...document.weeklyPlan,
        plan: updatedWeeklyPlan,
      },
      updatedAt: Date.now(),
    })
    setMessage({ message: 'Task deleted!', type: 'success' })
  }

  const deleteAllDoneTasks = () => {
    if (!document) {
      setError('Document not loaded')
      return
    }
    const updatedTasks = document.tasks.filter(task => !task.completed)
    if (updatedTasks.length === document.tasks.length) {
      setMessage({ message: 'No done tasks to delete', type: 'info' })

      return
    }
    updateDocument({
      ...document,
      tasks: updatedTasks,
      updatedAt: Date.now(),
    })

    setMessage({ message: 'All done tasks deleted!', type: 'success' })
  }

  return {
    handleBrainDumpSubmit,
    handleTaskUpdate,
    handleClearAllData,
    handleTaskDelete,
    deleteAllDoneTasks,
  }
}
