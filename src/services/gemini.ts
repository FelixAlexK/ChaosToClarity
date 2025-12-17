import type { ResponseV2 } from '@/types/ai_v2'
import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import META_PROMPT from '@/constants/prompt'
import { responseSchemaV2 } from '@/types/ai_v2'

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY })
const model = 'gemini-2.5-flash'

type GeminiTextResponse = { text?: string }
type PayloadSummary = { model: string; contentLength: number; date: string }

async function generate(content: string, date: string) {
  return ai.models.generateContent({
    model,
    contents: `${META_PROMPT}current date: ${date}\n\n${content}`,
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: z.toJSONSchema(responseSchemaV2),
    },
  })
}

function assertText(response: unknown, summary: PayloadSummary): string {
  if (!response || typeof response !== 'object') {
    throw new Error(`Invalid response from AI (not an object). request=${JSON.stringify(summary)}`)
  }

  const { text } = response as GeminiTextResponse
  if (!text) {
    throw new Error(
      `No text field in AI response. request=${JSON.stringify(summary)} responsePreview=${JSON.stringify(response)}`,
    )
  }
  return text
}

function parseJson(text: string, summary: PayloadSummary) {
  try {
    return JSON.parse(text)
  }
  catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    throw new Error(
      `Failed to parse AI response as JSON: ${reason}. request=${JSON.stringify(summary)}`,
    )
  }
}

function validateResponse(json: unknown) {
  const parsed = responseSchemaV2.safeParse(json)
  if (parsed.success) return parsed.data

  let errorDetails = ''
  try {
    errorDetails = JSON.stringify(z.treeifyError(parsed.error), null, 2)
  }
  catch {
    errorDetails = String(parsed.error)
  }

  throw new Error(
    `AI response failed schema validation. validationErrors=${errorDetails} responseJsonPreview=${JSON.stringify(json)}`,
  )
}

export async function sendBrainDumpToGemini(content: string): Promise<ResponseV2> {
  const date = new Date().toISOString().split('T')[0]
  const summary: PayloadSummary = { model, contentLength: content.length, date }

  let response
  try {
    response = await generate(content, date)
  }
  catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    throw new Error(`AI request failed (model=${model}, contentLength=${content.length}): ${reason}`)
  }

  const text = assertText(response, summary)
  const json = parseJson(text, summary)
  return validateResponse(json)
}
