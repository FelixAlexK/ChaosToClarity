import z from 'zod'
import { categories } from '@/utils/colors'

export const taskSchemaV2 = z.object({
  id: z.string().optional().describe('Unique identifier for the task.'),
  title: z.string().min(1).describe('The title of the task.'),
  description: z.string().optional().describe('Detailed description of the task.'),
  category: z.string().describe(`The category of the task, e.g. ${categories.join(', ')}.`),
  priority: z.enum(['high', 'medium', 'low']).describe('The priority level of the task.'),
  estimated_time: z.string().describe('Estimated time to complete the task, e.g., \'30min\', \'1h\'.'),
  deadline: z.string().nullable().describe('Deadline for the task if recognizable, otherwise null.'),
  completed: z.boolean().default(false).describe('Whether the task is completed.'),
  color: z.string().optional().describe('Color tag for the task.'),
  tags: z.array(z.string()).optional().describe('Additional tags for categorization.'),
})

export const daySchemaV2 = z.object({
  task: z.string().describe('Task for the day.'),
  taskId: z.string().optional().describe('Reference to the task ID.'),
  start: z.string().describe('Start date and time for the task. If not specified, use the given current date and time.'),
  end: z.string().describe('Deadline date and time for the task.'),
  completed: z.boolean().default(false).describe('Whether the task is completed on this day.'),
  notes: z.string().optional().describe('Additional notes for the day.'),
})

export const responseSchemaV2 = z.object({
  tasks: z.array(taskSchemaV2).describe('A list of organized tasks.'),
  weeklyPlan: z.object({
    monday: z.array(daySchemaV2).describe('Tasks for Monday.'),
    tuesday: z.array(daySchemaV2).describe('Tasks for Tuesday.'),
    wednesday: z.array(daySchemaV2).describe('Tasks for Wednesday.'),
    thursday: z.array(daySchemaV2).describe('Tasks for Thursday.'),
    friday: z.array(daySchemaV2).describe('Tasks for Friday.'),
    saturday: z.array(daySchemaV2).describe('Tasks for Saturday.'),
    sunday: z.array(daySchemaV2).describe('Tasks for Sunday.'),
  }).describe('A weekly plan with tasks assigned to each day.'),
})

export const storageSchemaV2 = z.object({
  id: z.uuid(),
  createdAt: z.coerce.number(),
  updatedAt: z.coerce.number(),
  tasks: z.array(responseSchemaV2.shape.tasks.element),
  weeklyPlan: z.object({
    id: z.uuid(),
    plan: responseSchemaV2.shape.weeklyPlan,
  }),
})

export type StorageDocumentV2 = z.infer<typeof storageSchemaV2>
export type TaskV2 = z.infer<typeof storageSchemaV2>['tasks'][number]
export type WeeklyPlanV2 = z.infer<typeof storageSchemaV2>['weeklyPlan']
export type PriorityV2 = z.infer<typeof taskSchemaV2>['priority']
export type ResponseV2 = z.infer<typeof responseSchemaV2>
