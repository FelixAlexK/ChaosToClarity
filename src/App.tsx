import { useState, type JSX } from 'react';
import './App.css'
import { BrainDumpInput } from './components/BrainDumpInput'
import { sendBrainDumpToGemini } from './services/gemini';
import { TaskCard } from './components/TaskCard';
import type z from 'zod';
import type { responseSchema } from './types/ai';

const example_response: z.infer<typeof responseSchema> = {
  "tasks": [
    {
      "title": "Finish project report",
      "category": "Work",
      "priority": "high",
      "estimated_time": "2 hours",
      "deadline": "2023-10-05"
    },
    {
      "title": "Grocery shopping",
      "category": "Personal",
      "priority": "medium",
      "estimated_time": "1 hour",
      "deadline": null
    },
    {
      "title": "Yoga session",
      "category": "Health",
      "priority": "low",
      "estimated_time": "30 minutes",
      "deadline": null
    },
    {
      "title": "Budget review",
      "category": "Finance",
      "priority": "medium",
      "estimated_time": "1 hour",
      "deadline": "2023-10-07"
    },
    {
      "title": "Read chapter 4 of textbook",
      "category": "Education",
      "priority": "high",
      "estimated_time": "3 hours",
      "deadline": "2023-10-06"
    }
  ],
  "weekly_plan": {
    "monday": ["Finish project report"],
    "tuesday": ["Grocery shopping"],
    "wednesday": [],
    "thursday": [],
    "friday": [],
    "saturday": [],
    "sunday": []
  }
}

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState<JSX.Element[]>([]);

  const loadExampleTasks = () => {

      const taskCards = example_response.tasks.map((task, index) => <TaskCard key={index} task={task}></TaskCard>  )
            setTasks(taskCards);
  }

  const handleBrainDumpSubmit = async (content: string) => {
    try {
      setIsProcessing(true);
      sendBrainDumpToGemini(content).then((response) => {
        const taskCards = response.tasks.map((task, index) => <TaskCard key={index} task={task}></TaskCard>  )
        setTasks(taskCards);
        setIsProcessing(false);
      });
    } catch (error) {
      console.error("Error processing brain dump:", error);
      setIsProcessing(false);
    }
  }

  return (
    <>
    <div className='space-y-10'>
      <BrainDumpInput onSubmit={handleBrainDumpSubmit}   isProcessing={isProcessing} ></BrainDumpInput>
      <button onClick={loadExampleTasks}>Load Example Tasks</button>
      <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl'>
        {tasks}
      </div>
    </div>
    </>
  )
}

export default App
