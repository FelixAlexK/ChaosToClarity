"use client"

import type { storageSchema } from '@/types/ai'
import { useEffect, useState, type SetStateAction } from 'react'

import { type Event, Views, dateFnsLocalizer } from 'react-big-calendar'
import type z from 'zod'

import {format, getDay, parse, startOfWeek} from 'date-fns'
import { enUS } from 'date-fns/locale'


import ShadcnBigCalendar from './shadcn-big-calendar/shadcn-big-calendar'


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
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState(Views.WEEK);


  useEffect(() => {
    if (weeklyPlan) {
      const plan = weeklyPlan.plan
      const newEvents: Event[] = []

      for (const [_, tasks] of Object.entries(plan)) {
        tasks.forEach(task => {
          newEvents.push({
            title: task.task,
            start: new Date(task.start),
            end: new Date(task.end),
            allDay: true
          })
        })
      }

      setEvents(newEvents)
    } 
  }, [weeklyPlan])

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: SetStateAction<any>) => {
    setView(newView);
  };

  return (
    <>
      
        <ShadcnBigCalendar
        localizer={localizer}
        style={{ height: 600, width: "100%" }}
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
