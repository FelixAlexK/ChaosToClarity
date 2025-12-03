import type { responseSchema } from "@/types/ai";
import type { monthDaySchema } from "@/types/calendar";
import {parseISO} from "date-fns";
import {useMemo} from "react";
import type z from "zod";
import {Badge} from "@/components/ui/badge"

interface CalendarDayHeaderProps {
  calendarDayObject: z.infer<typeof monthDaySchema>;
  weeklyPlan: z.infer<typeof responseSchema>["weekly_plan"] | null;
}

export function CalendarDayHeader({calendarDayObject, weeklyPlan}: CalendarDayHeaderProps) {
  const tasksForDay = useMemo(() => {
    if (!weeklyPlan) return [];

    const seen = new Set<string>();
    const result: { label: string; isDeadline: boolean }[] = [];

    const dateStr = calendarDayObject.dateString;
    if (!dateStr || !weeklyPlan) return result;

    let parsedDate: Date | null = null;
    try {
      parsedDate = parseISO(dateStr);
    } catch {
      parsedDate = null;
    }
    if (!parsedDate) return result;

    // iterate over each weekday entry in the weeklyPlan
    Object.values(weeklyPlan).forEach((weekday) => {
      if (!weekday) return;



      weekday.forEach((task) => {
        const start = task?.start;
        const rawEnd = task?.end ?? task?.start

        // direct string equality
        if (start === dateStr || rawEnd === dateStr) {
          const key = task.task;
          if (!seen.has(key)) {
            seen.add(key);
            result.push({label: task.task, isDeadline: rawEnd === dateStr});
          }
          return;
        }


      });
    });

    return result;
  }, [weeklyPlan, calendarDayObject.dateString]);


  return (
    <div className="w-full flex flex-col gap-2">
      <div className="p-2 min-w-0 text-left">
        <span className="font-bold block">{calendarDayObject.dayOfMonth}</span>

        <div className="flex flex-wrap gap-1 mt-2 min-w-0 items-start justify-start">
          {tasksForDay.map((t, i) => {
            const label = String(t.label);
            const isDeadline = Boolean(t.isDeadline);
            return (
              <Badge
                key={i}
                variant={isDeadline ? "destructive" : "default"}
                title={label}
                className="truncate max-w-full min-w-0 text-left justify-start items-start overflow-hidden"
              >
                {label}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
 }