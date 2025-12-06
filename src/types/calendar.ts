import z from 'zod'

export const monthDaySchema = z.object({
  dateString: z.string(),
  dayOfMonth: z.coerce.number(),
  isCurrentMonth: z.boolean(),
  isNextMonth: z.boolean(),
  isPreviousMonth: z.boolean(),
})

export type MonthDay = z.infer<typeof monthDaySchema>
