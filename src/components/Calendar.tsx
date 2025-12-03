import type { monthDaySchema } from "@/types/calendar";
import { createDaysForCurrentMonth, createDaysForNextMonth, createDaysForPreviousMonth, daysOfWeek, getMonthDropdownOptions, getMonthName, getYearDropdownOptions } from "@/utils/calendar";
import type React from "react";
import type z from "zod";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CalendarProps {
  // Define any props needed for the Calendar component
  yearAndMonth: number[];
  renderDay: (day: z.infer<typeof monthDaySchema>) => React.ReactNode;
  onYearAndMonthChange: (ym: [number, number]) => void;

}

export function Calendar({ yearAndMonth, renderDay, onYearAndMonthChange }: CalendarProps) {

  const [year, month] = yearAndMonth;

  const currentMonthDays = createDaysForCurrentMonth(year, month);

const previousMonthDays = createDaysForPreviousMonth(year, month, currentMonthDays);

const nextMonthDays = createDaysForNextMonth(year, month, currentMonthDays);



  const calendarGridDayObjects = [
    ...previousMonthDays,
    ...currentMonthDays,
    ...nextMonthDays
  ]

  const handleMonthNavBackButtonClick = () => {
    let nextYear = year;
    let nextMonth = month - 1;
    if (nextMonth === 0) {
      nextMonth = 12;
      nextYear = year - 1;
    }
    onYearAndMonthChange([nextYear, nextMonth]);
  };

  const handleMonthNavForwardButtonClick = () => {
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth === 13) {
      nextMonth = 1;
      nextYear = year + 1;
    }
    onYearAndMonthChange([nextYear, nextMonth]);
  };

  const handleMonthSelect = (value: string) => {
    console.log("Selected month:", value);
    const nextYear = year;
    const nextMonth = parseInt(value, 10);
    onYearAndMonthChange([nextYear, nextMonth]);
  };

  const handleYearSelect = (value: string) => {
    console.log("Selected year:", value);
    const nextMonth = month;
    const nextYear = parseInt(value, 10);
    onYearAndMonthChange([nextYear, nextMonth]);
  };

  return (
    <div className="w-full calendar-root">
      <div className="flex gap-4 items-center w-full justify-center mb-8">
        <div>
          <Button onClick={handleMonthNavBackButtonClick}>Previous</Button>

        </div>
        <Select value={month.toString()} onValueChange={handleMonthSelect}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={getMonthName(month, year)} />
          </SelectTrigger>
          <SelectContent>
            {getMonthDropdownOptions().map(({ label, value }) => (
              <SelectItem key={value} value={value.toString()}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
          <Select value={year.toString()} onValueChange={handleYearSelect}>
             <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={`${year}`} />
          </SelectTrigger>
          <SelectContent>
            {getYearDropdownOptions(year).map(({label, value}) => (
              <SelectItem key={value} value={value.toString()}>{label}</SelectItem>
            ))}
          </SelectContent>
          </Select>
          <div>
          <Button onClick={handleMonthNavForwardButtonClick}>Next</Button>
        </div>
      </div>
      <div className="w-full grid grid-cols-7 gap-0.5 box-border days-of-week">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="py-2 min-w-0 truncate day-of-week-header-cell">
            {day}
          </div>
        ))}
      </div>
      <div className="w-full grid grid-cols-7 h-[700px] overflow-hidden days-grid bg-black gap-px border border-r-white border-black box-border">
       {calendarGridDayObjects.map((day) => (
         <div className="bg-white" key={day.dateString}>
           <div className="flex-1 min-h-0">{renderDay(day) }</div>
         </div>
       ))}
      </div>
    </div>
  );
}
