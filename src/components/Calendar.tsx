'use client'

import type { SetStateAction } from 'react'
import type { Event } from 'react-big-calendar'

import type z from 'zod'
import type { storageSchema } from '@/types/ai'

import { format, getDay, parse, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { dateFnsLocalizer, Views } from 'react-big-calendar'

import ShadcnBigCalendar from './shadcn-big-calendar/shadcn-big-calendar'
import { set } from 'zod'

interface CalendarProps {
  weeklyPlan?: z.infer<typeof storageSchema>['weeklyPlan']
}

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export function Calendar({ weeklyPlan }: CalendarProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState(Views.WEEK)

  const newEvents: Event[] = []
  useEffect(() => {
    if (weeklyPlan) {
      const plan = weeklyPlan.plan

      for (const [_, tasks] of Object.entries(plan)) {
        tasks.forEach((task) => {
          newEvents.push({
            title: task.task,
            start: new Date(task.start),
            end: new Date(task.end),
            allDay: true,
          })
        })
      }
      setEvents(newEvents)
      
    }
  }, [weeklyPlan])

  

  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
  }

  const handleViewChange = (newView: SetStateAction<any>) => {
    setView(newView)
  }

  return (
    <>

      <ShadcnBigCalendar
        localizer={localizer}
        style={{ height: 600, width: '100%' }}
        className="border-border border-rounded-md border-solid border-2 rounded-lg" // Optional border
        selectable
        date={date}
        onNavigate={handleNavigate}
        view={view}
        onView={handleViewChange}
        events={events}
      />

    </>

  )
}
