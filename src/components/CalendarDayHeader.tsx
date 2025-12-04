import type z from 'zod'
import type { responseSchema } from '@/types/ai'
import type { monthDaySchema } from '@/types/calendar'
import { parseISO } from 'date-fns'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'

interface CalendarDayHeaderProps {
  calendarDayObject: z.infer<typeof monthDaySchema>
  weeklyPlan: z.infer<typeof responseSchema>['weeklyPlan'] | null
}

export function CalendarDayHeader({ calendarDayObject, weeklyPlan }: CalendarDayHeaderProps) {
  const tasksForDay = useMemo(() => {
    if (!weeklyPlan)
      return []

    const seen = new Set<string>()
    const result: { label: string, isDeadline: boolean }[] = []

    const dateStr = calendarDayObject.dateString
    if (!dateStr || !weeklyPlan)
      return result

    let parsedDate: Date | null = null
    try {
      parsedDate = parseISO(dateStr)
    }
    catch {
      parsedDate = null
    }
    if (!parsedDate)
      return result

    // iterate over each weekday entry in the weeklyPlan
    Object.values(weeklyPlan).forEach((weekday) => {
      if (!weekday)
        return

      weekday.forEach((task) => {
        const start = task?.start
        const rawEnd = task?.end ?? task?.start

        // direct string equality
        if (start === dateStr || rawEnd === dateStr) {
          const key = task.task
          if (!seen.has(key)) {
            seen.add(key)
            result.push({ label: task.task, isDeadline: rawEnd === dateStr && rawEnd !== start })
          }
        }
      })
    })

    return result
  }, [weeklyPlan, calendarDayObject.dateString])

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="p-2 min-w-0">
        <span className="font-bold">{calendarDayObject.dayOfMonth}</span>
        <div className="flex flex-wrap gap-1 mt-2 min-w-0 items-start">
          {tasksForDay.map((task, index) => (
            <Badge
              key={index}
              variant={task.isDeadline ? 'destructive' : 'default'}
              title={task.label}
              className="truncate max-w-full min-w-0 text-left justify-start items-start "
            >
              {task.label}
            </Badge>
          ))}
        </div>

      </div>

    </div>
  )
}
