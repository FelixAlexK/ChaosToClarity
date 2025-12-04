import type z from 'zod'
import type { storageSchema, taskSchema } from '@/types/ai'
import { is } from 'date-fns/locale'
import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { getCategoryHex, getCustomColor } from '@/utils/categoryToColor'
import { Button } from './ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

type Task = z.infer<typeof storageSchema>['tasks'][number]

interface TaskCardsProps {
  task: Task
  updateTask: (updatedTask: Partial<Task>) => void
}

export function TaskCard({ task, updateTask }: TaskCardsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newTitle, setNewTitle] = useState(task.title)
  const [newCategory, setNewCategory] = useState(task.category)
  const [newPriority, setNewPriority] = useState(task.priority)
  const [newEstimatedTime, setNewEstimatedTime] = useState(task.estimated_time)
  const [newDeadline, setNewDeadline] = useState(task.deadline)
  const [color, setColor] = useState(task.color ?? (() => getCustomColor(getCategoryHex(task.category), 100))())

  const [currentColor, setCurrentColor] = useState(color)

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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isEditing) {
      setIsEditing(false)
      // Reset fields to original values
      setNewTitle(task.title)
      setNewCategory(task.category)
      setNewPriority(task.priority)
      setNewEstimatedTime(task.estimated_time)
      setNewDeadline(task.deadline)

      toast.info('Edit cancelled')
    }

    if (e.key === 'Enter' && isEditing) {
      handleSave()
    }

    e.preventDefault()
  })

  return (
    <Card
      className="w-full"
      style={{
        backgroundColor: `${getCustomColor(color, 20)}`,
        border: `1px solid ${getCustomColor(color, 60)}`,
      }}
    >
      {!isEditing && (
        <>
          <CardHeader>
            <CardDescription>
              {task.category}
            </CardDescription>
            <CardTitle>{task.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <CardDescription>
              Priority:
              {' '}
              {task.priority}
            </CardDescription>
            <CardDescription>
              Estimated Time:
              {' '}
              {task.estimated_time}
            </CardDescription>
            <CardDescription>
              Deadline:
              {' '}
              {task.deadline ?? 'N/A'}
            </CardDescription>
          </CardContent>
        </>
      )}

      {isEditing && (
        <>
          <CardHeader>
            <Input
              onChange={e => setNewCategory(e.target.value)}

              type="text"
              value={task.category}
            />
            <Input
              onChange={e => setNewTitle(e.target.value)}

              type="text"
              value={task.title}
            />
          </CardHeader>
          <CardContent className="space-y-2">

            <Select value={task.priority} onValueChange={value => setNewPriority(value as z.infer<typeof taskSchema>['priority'])}>
              <SelectTrigger className="w-[180px]">
                <SelectValue className="capitalize" />
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
              value={`${task.estimated_time}`}

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

      <CardFooter className="flex flex-row">
        <Button
          variant="link"
          className=""
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? 'Save' : 'Edit'}
        </Button>
        <Button
          variant="link"
          className=""
          onClick={() => handleCancel()}
        >
          {isEditing && 'Cancel'}
        </Button>
      </CardFooter>
    </Card>
  )
}
