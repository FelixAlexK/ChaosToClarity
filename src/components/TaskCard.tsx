import type z from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import type { taskSchema } from "@/types/ai";
import { categoryToColor } from "@/utils/categoryToColor";

interface TaskCardsProps {
  task: z.infer<typeof taskSchema>;
}

export function TaskCard({ task }: TaskCardsProps) {
  return <Card className={`w-full`} style={{ backgroundColor: ` ${categoryToColor(task.category, 20)}`, border: `1px solid ${categoryToColor(task.category, 60)}` }}>
    <CardHeader>
      <CardDescription>{task.category}</CardDescription>
      <CardTitle>{task.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>Priority: {task.priority}</CardDescription>
      <CardDescription>Estimated Time: {task.estimated_time}</CardDescription>
      <CardDescription>Deadline: {task.deadline ?? "N/A"}</CardDescription>
    </CardContent>
  </Card>;
}