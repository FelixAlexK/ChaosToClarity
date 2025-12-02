import { useState } from 'react';
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"

export function WeeklyPlanDrawer() {
  const [date, setDate] = useState<Date | undefined>(undefined);



  return (
    <div className="w-full max-w-4xl mx-auto">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            className="rounded-lg border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
            numberOfMonths={1}
            components={{
              DayButton: ({ children, modifiers, day, ...props  }) => {

                const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6
              return (
                <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                {children}
              {!modifiers.outside && <span>{isWeekend ? "$220" : "$100"}</span>}
                </CalendarDayButton>
              )
            }
            }}
          />
    </div>

  );
}
