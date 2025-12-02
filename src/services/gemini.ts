import PROMPT_TEMPLATE from "@/constants/prompt";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({apiKey: import.meta.env.VITE_GOOGLE_API_KEY});

const taskSchema = z.object({
  title: z.string().describe("The title of the task."),
  category: z.string().describe("The category of the task."),
  priority: z.enum(["high", "medium", "low"]).describe("The priority level of the task."),
  estimated_time: z.string().describe("Estimated time to complete the task, e.g., '30min', '1h'."),
  deadline: z.string().nullable().describe("Deadline for the task if recognizable, otherwise null."),
});

export const responseSchema = z.object({
  tasks: z.array(taskSchema).describe("A list of organized tasks."),
  weekly_plan: z.object({
    monday: z.array(z.string()).describe("Tasks for Monday."),
    tuesday: z.array(z.string()).describe("Tasks for Tuesday."),
    wednesday: z.array(z.string()).describe("Tasks for Wednesday."),
    thursday: z.array(z.string()).describe("Tasks for Thursday."),
    friday: z.array(z.string()).describe("Tasks for Friday."),
    saturday: z.array(z.string()).describe("Tasks for Saturday."),
    sunday: z.array(z.string()).describe("Tasks for Sunday."),
  }).describe("A weekly plan with tasks assigned to each day."),
});


export async function sendBrainDumpToGemini(content: string): Promise<z.infer<typeof responseSchema>> {
  // Placeholder function to simulate sending content to an AI service
 const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: PROMPT_TEMPLATE + "\n\n" + content,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(responseSchema),
    }

})

if(!response.text) {
  throw new Error("No response from AI");
}

  return responseSchema.parse(JSON.parse(response.text));
}