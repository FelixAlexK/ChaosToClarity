import type { z } from 'zod'
import type { monthDaySchema } from '@/types/calendar'
import { format, getDay, getDaysInMonth, subDays, subMonths } from 'date-fns'

export const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export function getMonthName(month: number, year: number = new Date().getFullYear()): string {
  // month is 1-based here (1 = January)
  return format(new Date(year, month - 1), 'MMMM')
}

export function getNumberOfDaysInMonth(year: number, month: number): number {
  return getDaysInMonth(new Date(year, month - 1))
}

// helper: parse yyyy-MM-dd into a local-date Date (avoids UTC-string parsing issues)
export function parseDateString(dateString: string): Date {
  const [y, m, d] = dateString.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function createDaysForCurrentMonth(year: number, month: number): z.infer<typeof monthDaySchema>[] {
  return Array.from({ length: getNumberOfDaysInMonth(year, month) }, (_, index) => {
    const date = new Date(year, month - 1, index + 1)
    return {
      dateString: format(date, 'yyyy-MM-dd'),
      dayOfMonth: index + 1,
      isCurrentMonth: true,
      isNextMonth: false,
      isPreviousMonth: false,
    }
  })
}

export function createDaysForPreviousMonth(year: number, month: number, currentMonthDays: z.infer<typeof monthDaySchema>[]): z.infer<typeof monthDaySchema>[] {
  const firstDayOfTheMonthWeekday = getWeekday(currentMonthDays[0].dateString)
  const previousMonth = subMonths(new Date(year, month - 1, 1), 1)

  const visibleNumberOfDaysFromPreviousMonth = firstDayOfTheMonthWeekday

  const previousMonthLastMondayDayOfMonth = subDays(parseDateString(
    currentMonthDays[0].dateString,
  ), visibleNumberOfDaysFromPreviousMonth).getDate()

  return [...[visibleNumberOfDaysFromPreviousMonth]].map((_, index) => {
    return {
      dateString: format(new Date(
        previousMonth.getFullYear(),
        previousMonth.getMonth(),
        previousMonthLastMondayDayOfMonth + index,
      ), 'yyyy-MM-dd'),
      dayOfMonth: previousMonthLastMondayDayOfMonth + index,
      isNextMonth: false,
      isCurrentMonth: false,
      isPreviousMonth: true,
    }
  })
}

export function createDaysForNextMonth(year: number, month: number, currentMonthDays: z.infer<typeof monthDaySchema>[]): z.infer<typeof monthDaySchema>[] {
  // use the actual last day date string from currentMonthDays (safer)
  const lastDayOfTheMonthWeekday = getWeekday(currentMonthDays[currentMonthDays.length - 1].dateString)
  // month is 1-based, so new Date(year, month, 1) gives next month's first day
  const nextMonth = new Date(year, month, 1)
  const visibleNumberOfDaysFromNextMonth = 6 - lastDayOfTheMonthWeekday

  return [...[visibleNumberOfDaysFromNextMonth]].map((_, index) => {
    return {
      dateString: format(
        new Date(
          nextMonth.getFullYear(),
          nextMonth.getMonth(),
          index + 1,
        ),
        'yyyy-MM-dd',
      ),
      dayOfMonth: index + 1,
      isCurrentMonth: false,
      isPreviousMonth: false,
      isNextMonth: true,
    }
  })
}
export function getWeekday(dateString: string): number {
  return getDay(parseDateString(dateString))
}

export function isWeekendDay(dateString: string): boolean {
  return [6, 0].includes(getWeekday(dateString))
}

// range helper: start inclusive, endExclusive
function range(start: number, endExclusive: number): number[] {
  return Array.from({ length: Math.max(0, endExclusive - start) }, (_, i) => start + i)
}

export function getYearDropdownOptions(currentYear: number): { label: string, value: number }[] {
  const minYear = currentYear - 4
  const maxYear = currentYear + 5
  return range(minYear, maxYear + 1).map(y => ({ label: `${y}`, value: y }))
}

export function getMonthDropdownOptions() {
  // return months 1..12 with human readable labels
  return range(1, 13).map(m => ({
    value: m,
    label: format(new Date(2020, m - 1), 'MMMM'),
  }))
}
