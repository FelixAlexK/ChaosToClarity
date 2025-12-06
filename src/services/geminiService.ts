import type { Response } from '@/types/ai'
import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import { responseSchema } from '@/types/ai'

const META_PROMPT = `
Act as an expert Task Organizer.
I'll give you unstructed text containing various tasks.
Analyze the unstructured text and extract clear tasks.
Make sure to break down complex tasks into smaller, manageable subtasks.
Organize the tasks into a structured format, categorizing them by priority (High, Medium, Low) and due dates if provided.
Create a weekly plan assigning tasks to each day of the week, with start and end dates in format yyyy-MM-dd.
Also use the current date as a reference for scheduling.
The final output should be in JSON format.
`

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY })

export async function sendBrainDumpToGemini(content: string): Promise<Response> {
  const model = 'gemini-2.5-flash'
  const DATE = new Date().toISOString().split('T')[0]

  const truncate = (s: string | undefined, n = 1000) =>
    typeof s === 'string' && s.length > n ? `${s.slice(0, n)}…(truncated ${s.length - n} chars)` : String(s ?? '')

  // Build payload summary (avoid including full content in error messages)
  const payloadSummary = { model, contentLength: content.length, date: DATE }

  let response: any
  try {
    response = await ai.models.generateContent({
      model,
      contents: `${META_PROMPT}current date: ${DATE}\n\n${content}`,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: z.toJSONSchema(responseSchema),
      },
    })
  }
  catch (err) {
    throw new Error(
      `AI request failed (model=${model}, contentLength=${content.length}): ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  if (!response || typeof response !== 'object') {
    throw new Error(`Invalid response from AI (not an object). request=${JSON.stringify(payloadSummary)}`)
  }

  if (!('text' in response) || !response.text) {
    // include a truncated representation of the response for debugging
    throw new Error(
      `No text field in AI response. request=${JSON.stringify(payloadSummary)} responsePreview=${truncate(
        JSON.stringify(response),
        1000,
      )}`,
    )
  }

  let json: any
  try {
    json = JSON.parse(response.text)
  }
  catch (e) {
    throw new Error(
      `Failed to parse AI response as JSON: ${e instanceof Error ? e.message : String(e)}. responsePreview=${truncate(
        response.text,
        1000,
      )}`,
    )
  }

  const parsedResponse = responseSchema.safeParse(json)
  if (!parsedResponse.success) {
    let errorDetails = ''
    try {
      // format() gives structured info about which fields failed validation
      errorDetails = JSON.stringify(parsedResponse.error.format(), null, 2)
    }
    catch {
      errorDetails = String(parsedResponse.error)
    }
    throw new Error(
      `AI response failed schema validation. validationErrors=${truncate(errorDetails, 2000)} responseJsonPreview=${truncate(
        JSON.stringify(json),
        1000,
      )}`,
    )
  }

  return parsedResponse.data
}
