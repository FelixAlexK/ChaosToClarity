import z from "zod";

export const taskSchema = z.object({
  title: z.string().describe("The title of the task."),
  category: z.string().describe("The category of the task."),
  priority: z.enum(["high", "medium", "low"]).describe("The priority level of the task."),
  estimated_time: z.string().describe("Estimated time to complete the task, e.g., '30min', '1h'."),
  deadline: z.string().nullable().describe("Deadline for the task if recognizable, otherwise null."),
});

export const daySchema = z.object({
  task: z.string().describe("Task for the day."),
  start: z.string().describe("Start date for the task. If not specified, use the given current date."),
  end: z.string().describe("Deadline for the task."),
})

export const responseSchema = z.object({
  tasks: z.array(taskSchema).describe("A list of organized tasks."),
  weekly_plan: z.object({
    monday: z.array(daySchema).describe("Tasks for Monday."),
    tuesday: z.array(daySchema).describe("Tasks for Tuesday."),
    wednesday: z.array(daySchema).describe("Tasks for Wednesday."),
    thursday: z.array(daySchema).describe("Tasks for Thursday."),
    friday: z.array(daySchema).describe("Tasks for Friday."),
    saturday: z.array(daySchema).describe("Tasks for Saturday."),
    sunday: z.array(daySchema).describe("Tasks for Sunday."),
  }).describe("A weekly plan with tasks assigned to each day."),
});