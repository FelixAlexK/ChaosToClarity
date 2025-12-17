import type { ToastT } from 'sonner'
import { Calendar1, Grid2X2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Calendar } from '@/components/Calendar'
import { TaskCard } from '@/components/TaskCard'
import { Button } from '@/components/ui/button'
import { useSyncKitDocument, useTaskManagementHandlers } from '@/hooks/useSyncKit'
import { ToolLayout } from '@/layouts/toolLayout'
import { BrainDumpInput } from '../components/BrainDumpInput'
import { ModeToggle } from '../components/ModeToggle'
import { SettingsDropdown } from '../components/SettingsDropdown'

export function MainPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toggleView, setToggleView] = useState(true)
  const [message, setMessage] = useState<{ message: string, type: Exclude<ToastT['type'], 'error'> } | null>(null)
  const { document, updateDocument } = useSyncKitDocument({ setError, setMessage })

  const {
    handleBrainDumpSubmit,
    handleTaskUpdate,
    handleClearAllData,
    handleTaskDelete,
    deleteAllDoneTasks,
  } = useTaskManagementHandlers({ document, updateDocument, setIsProcessing, setError, setMessage })

  useEffect(() => {
    if (!message) {
      return
    }

    const { message: msg, type } = message

    if (type === 'success') {
      toast.success(msg)
    }
    else {
      toast.info(msg)
    }
  }, [message])

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
            <SettingsDropdown deleteAllDoneTasks={deleteAllDoneTasks} clearAllData={handleClearAllData}></SettingsDropdown>
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
                      deleteTask={handleTaskDelete}
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
