import OpenAI from "openai"
import { toFile } from "openai/uploads"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function transcribeAudio(audio: Blob | ArrayBuffer, filename = "audio.webm"): Promise<string> {
  const blob = audio instanceof Blob ? audio : new Blob([audio])
  const file = await toFile(blob, filename, { type: "audio/webm" })

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "text",
    language: "fr",
  })

  // With response_format: "text" the SDK returns a plain string
  return transcription as unknown as string
}
