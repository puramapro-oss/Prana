/**
 * ElevenLabs TTS — Phase 2 (audio guidé optionnel des protocoles).
 * Stub safe pour Phase 1 : retourne null si pas de clé configurée.
 */

const API_KEY = process.env.ELEVENLABS_API_KEY
const VOICE_FR = process.env.ELEVENLABS_VOICE_ID_FR
const VOICE_EN = process.env.ELEVENLABS_VOICE_ID_EN

export async function synthesizeSpeech(
  text: string,
  locale: "fr" | "en" = "fr",
): Promise<ArrayBuffer | null> {
  if (!API_KEY) return null
  const voiceId = locale === "fr" ? VOICE_FR : VOICE_EN
  if (!voiceId) return null

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.6, similarity_boost: 0.75 },
    }),
  })

  if (!res.ok) return null
  return res.arrayBuffer()
}
