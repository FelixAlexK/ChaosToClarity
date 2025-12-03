import type { JSX } from 'react'
import type z from 'zod'
import type { responseSchema } from './types/ai'
import { useState } from 'react'
import { BrainDumpInput } from './components/BrainDumpInput'
import { Calendar } from './components/Calendar'
import { CalendarDayHeader } from './components/CalendarDayHeader'
import { TaskCard } from './components/TaskCard'
import { sendBrainDumpToGemini } from './services/gemini'

const example_response: z.infer<typeof responseSchema> = {
  tasks: [
    {
      title: 'Finish project report',
      category: 'Work',
      priority: 'high',
      estimated_time: '2 hours',
      deadline: '2023-10-05',
    },
    {
      title: 'Grocery shopping',
      category: 'Personal',
      priority: 'medium',
      estimated_time: '1 hour',
      deadline: null,
    },
    {
      title: 'Yoga session',
      category: 'Health',
      priority: 'low',
      estimated_time: '30 minutes',
      deadline: null,
    },
    {
      title: 'Budget review',
      category: 'Finance',
      priority: 'medium',
      estimated_time: '1 hour',
      deadline: '2023-10-07',
    },
    {
      title: 'Read chapter 4 of textbook',
      category: 'Education',
      priority: 'high',
      estimated_time: '3 hours',
      deadline: '2023-10-06',
    },
  ],
  weekly_plan: {
    monday: [{ task: 'Finish project report', end: '2023-10-05', start: '2023-10-05' }],
    tuesday: [{ task: 'Grocery shopping', end: '2023-10-08', start: '2023-10-07' }],
    wednesday: [{ task: 'Yoga session', end: '2023-10-10', start: '2023-10-09' }],
    thursday: [{ task: 'Budget review', end: '2023-10-07', start: '2023-10-05' }],
    friday: [],
    saturday: [],
    sunday: [],
  },
}

function App() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [taskCards, setTaskCards] = useState<JSX.Element[]>([])
  const [weeklyPlan, setWeeklyPlan] = useState<z.infer<typeof responseSchema>['weekly_plan'] | null>(null)
  const [yearAndMonth, setYearAndMonth] = useState([new Date().getFullYear(), new Date().getMonth() + 1])

  const loadExampleTasks = () => {
    const taskCards = example_response.tasks.map((task, index) => <TaskCard key={index} task={task}></TaskCard>)
    const weeklyPlan = example_response.weekly_plan
    setWeeklyPlan(weeklyPlan)
    setTaskCards(taskCards)
  }

  const handleBrainDumpSubmit = async (content: string) => {
    try {
      setIsProcessing(true)
      sendBrainDumpToGemini(content).then((response) => {
        const taskCards = response.tasks.map((task, index) => <TaskCard key={index} task={task}></TaskCard>)
        const weeklyPlan = response.weekly_plan
        setWeeklyPlan(weeklyPlan)
        setTaskCards(taskCards)
        setIsProcessing(false)
      })
    }
    catch (error) {
      console.error('Error processing brain dump:', error)
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="w-full max-w-4xl space-y-4 mx-auto p-1 md:px-4 py-8">
        <BrainDumpInput onSubmit={handleBrainDumpSubmit} isProcessing={isProcessing}></BrainDumpInput>
        <button onClick={loadExampleTasks}>Load Example Tasks</button>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl">
          {taskCards}
        </div>
        <div>
          <Calendar onYearAndMonthChange={setYearAndMonth} yearAndMonth={yearAndMonth} renderDay={day => <CalendarDayHeader weeklyPlan={weeklyPlan} calendarDayObject={day} />}></Calendar>
        </div>
      </div>
    </>
  )
}

export default App
