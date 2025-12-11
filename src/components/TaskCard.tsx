import type { PriorityV2, TaskV2 } from '@/types/ai_v2'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { getCategoryHex, getCustomColor } from '@/utils/colors'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface TaskCardsProps {
  task: TaskV2
  updateTask: (updatedTask: Partial<TaskV2>) => void
  deleteTask: (id: string) => void
}

export function TaskCard({ task, updateTask, deleteTask }: TaskCardsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newTitle, setNewTitle] = useState(task.title)
  const [newCategory, setNewCategory] = useState(task.category)
  const [newPriority, setNewPriority] = useState(task.priority)
  const [newEstimatedTime, setNewEstimatedTime] = useState(task.estimated_time)
  const [newDeadline, setNewDeadline] = useState(task.deadline)
  const [color, setColor] = useState(task.color ?? (() => getCustomColor(getCategoryHex(task.category), 100))())
  const [currentColor, setCurrentColor] = useState(color)
  const [completed, setCompleted] = useState(task.completed ?? false)

  const handleSave = () => {
    updateTask({
      id: task.id,
      title: newTitle,
      category: newCategory,
      priority: newPriority,
      estimated_time: newEstimatedTime,
      deadline: newDeadline,
      color,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setColor(currentColor)

    setIsEditing(false)
  }

  const handleMarkTaskAsDone = (isCompleted: boolean) => {
    setCompleted(isCompleted)
    updateTask({
      id: task.id,
      completed: isCompleted,
    })
  }

  if (completed && !isEditing) {
    return <TaskCardDelete deleteTask={deleteTask} markedAsDone={() => handleMarkTaskAsDone(!completed)} task={task} />
  }

  return (
    <Card
      onClick={() => setCompleted(!completed)}
      className="w-full"
      style={{
        border: `1px solid ${getCustomColor(color, 60)}`,
        background: `linear-gradient(135deg, ${getCustomColor(color, 20)} 0%, ${getCustomColor(color, 10)} 100%)`,
      }}
    >
      {!isEditing && (
        <>
          <CardHeader>
            <CardDescription className="uppercase text-stone-400 flex justify-between items-center">
              {task.category}
              <Button
                variant="link"
                className=""

                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                Edit
              </Button>

            </CardDescription>
            <CardTitle className="text-xl truncate">{task.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <TaskCardDetail className="capitalize" label="Priority" value={task.priority} />
            <TaskCardDetail label="Estimated Time" value={task.estimated_time} />
            <TaskCardDetail label="Deadline" value={task.deadline ?? 'N/A'} />
          </CardContent>
        </>
      )}

      {isEditing && (
        <>
          <CardHeader>
            <Input
              onChange={e => setNewCategory(e.target.value)}

              type="text"
              placeholder={task.category}
            />
            <Input
              onChange={e => setNewTitle(e.target.value)}

              type="text"
              placeholder={task.title}
            />
          </CardHeader>
          <CardContent className="space-y-2">

            <Select onValueChange={value => setNewPriority(value as PriorityV2)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={task.priority} className="capitalize" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Input
              onChange={(e) => {
                setNewEstimatedTime(`${e.target.value}`)
              }}

              type="text"
              placeholder={`${task.estimated_time}`}

            />

            <Input
              onChange={e => setNewDeadline(e.target.value)}
              type="date"

            />

            <Input
              onClick={e => setCurrentColor(e.currentTarget.value)}
              onChange={e => setColor(e.target.value)}
              type="color"

              value={color}
            />
          </CardContent>
        </>
      )}

      {isEditing && (
        <CardFooter className="flex flex-row">
          <Button
            variant="link"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? 'Save' : 'Edit'}
          </Button>
          <Button
            variant="link"
            onClick={() => handleCancel()}
          >
            {isEditing && 'Cancel'}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

function TaskCardDetail({ label, value, className }: { label: string, value: string, className?: string }) {
  return (
    <div className="flex flex-col gap-px">
      <small className="text-sm leading-none font-medium text-muted-foreground">{label}</small>
      <p className={`text-lg font-semibold ${className}`}>{value}</p>
    </div>
  )
}

function TaskCardDelete({ task, markedAsDone, deleteTask }: { task: TaskV2, markedAsDone: () => void, deleteTask: (id: string) => void }) {
  return (
    <Card onClick={markedAsDone} className="bg-muted-foreground/20 border-muted-foreground/60">
      <CardHeader>
        <CardDescription className="uppercase text-muted-foreground flex justify-between items-center">
          {task.category}
          <Button
            variant="destructive"
            className="text-white"
            onClick={() => deleteTask(task.id!)}
          >
            Delete
          </Button>

        </CardDescription>
        <CardTitle className="text-xl truncate text-muted-foreground">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-muted-foreground">
        <TaskCardDetail className="capitalize" label="Priority" value={task.priority} />
        <TaskCardDetail label="Estimated Time" value={task.estimated_time} />
        <TaskCardDetail label="Deadline" value={task.deadline ?? 'N/A'} />
      </CardContent>
    </Card>
  )
}
