import type { JSX } from 'react'
import type z from 'zod'
import type { responseSchema } from './types/ai'
import { useState } from 'react'
import { toast } from 'sonner'
import { BrainDumpInput } from './components/BrainDumpInput'
import { Calendar } from './components/Calendar'
import { CalendarDayHeader } from './components/CalendarDayHeader'
import { ModeToggle } from './components/ModeToggle'
import { TaskCard } from './components/TaskCard'
import { sendBrainDumpToGemini } from './services/gemini'

function App() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [taskCards, setTaskCards] = useState<JSX.Element[]>([])
  const [weeklyPlan, setWeeklyPlan] = useState<z.infer<typeof responseSchema>['weekly_plan'] | null>(null)
  const [yearAndMonth, setYearAndMonth] = useState([new Date().getFullYear(), new Date().getMonth() + 1])

  const handleBrainDumpSubmit = async (content: string) => {
    try {
      setIsProcessing(true)

      const response = await sendBrainDumpToGemini(content)
      const taskCards = response.tasks.map((task, index) => <TaskCard key={index} task={task}></TaskCard>)
      const weeklyPlan = response.weekly_plan

      setWeeklyPlan(weeklyPlan)
      setTaskCards(taskCards)
      toast.info('AI generated your weekly plan!')
    }
    catch (error) {
      console.error('Error processing brain dump:', error)

      const rawMessage = error instanceof Error ? error.message : String(error)
      const truncate = (s: string, n = 200) => (s && s.length > n ? `${s.slice(0, n)}…` : s)

      toast.error(
        `Failed to organize your mind: ${truncate(rawMessage, 200)}`,
        {
          action: {
            label: 'Retry',
            onClick: () => handleBrainDumpSubmit(content),
          },
        },
      )
    }
    finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {' '}
      <header className="w-full max-w-4xl flex justify-center mx-auto p-1 md:px-4 pt-8">
        <div className="flex justify-between  items-center w-full">

          <h1 className="flex justify-center w-full text-xl font-bold">Chaos to Clarity</h1>

          <ModeToggle></ModeToggle>

        </div>

      </header>
      <main>
        <div className="w-full max-w-4xl space-y-4 mx-auto p-1 md:px-4 pb-8">
          <BrainDumpInput onSubmit={handleBrainDumpSubmit} isProcessing={isProcessing}></BrainDumpInput>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl">
            {taskCards}
          </div>
          <div>
            <Calendar onYearAndMonthChange={setYearAndMonth} yearAndMonth={yearAndMonth} renderDay={day => <CalendarDayHeader weeklyPlan={weeklyPlan} calendarDayObject={day} />}></Calendar>
          </div>
        </div>
      </main>
      {' '}

    </>

  )
}

export default App
