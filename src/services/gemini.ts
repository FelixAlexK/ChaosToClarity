import PROMPT_TEMPLATE from "@/constants/prompt";
import { responseSchema } from "@/types/ai";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({apiKey: import.meta.env.VITE_GOOGLE_API_KEY});

export async function sendBrainDumpToGemini(content: string): Promise<z.infer<typeof responseSchema>> {
  // Placeholder function to simulate sending content to an AI service
 const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: PROMPT_TEMPLATE + `current date: ${new Date().toISOString().split('T')[0]}` + "\n\n" + content,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(responseSchema),
    }

})

if(!response.text) {
  throw new Error("No response from AI");
}

  const parsedResponse = responseSchema.safeParse(JSON.parse(response.text));

  if (!parsedResponse.success) {
    throw new Error("Invalid response format from AI");
  }

  return parsedResponse.data;
}