import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { apiLimiter } from "@/lib/upstash"
import type { Plan } from "@/lib/supabase/types"

const Schema = z.object({
  text: z.string().min(1).max(2000),
  locale: z.enum(["fr", "en"]).default("fr"),
})

const PRO_PLANS: Plan[] = ["pro", "ultime"]

/**
 * ElevenLabs TTS proxy. Pro/Ultime gating.
 * Stub for now — returns 501 with a clear message until ElevenLabs voice IDs
 * are provisioned and credit budget configured. Component falls back to
 * silent mode (visual breathing only).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Connecte-toi." }, { status: 401 })
    }

    const limit = await apiLimiter.limit(`tts:${user.id}`)
    if (!limit.success) {
      return NextResponse.json({ error: "Trop de requêtes audio. Patiente." }, { status: 429 })
    }

    const profileResp = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle()
    const profile = profileResp.data as { plan: Plan } | null
    const userPlan: Plan = profile?.plan ?? "free"

    if (!PRO_PLANS.includes(userPlan)) {
      return NextResponse.json(
        {
          error: "L'audio guidé est réservé aux plans Pro et Ultime.",
          upgradeRequired: "pro",
        },
        { status: 402 },
      )
    }

    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    const voiceId =
      parsed.data.locale === "en"
        ? process.env.ELEVENLABS_VOICE_ID_EN
        : process.env.ELEVENLABS_VOICE_ID_FR

    if (!apiKey || !voiceId) {
      return NextResponse.json(
        { error: "Audio guidé pas encore activé. Le mode visuel reste disponible." },
        { status: 501 },
      )
    }

    const ttsResp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: parsed.data.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.55, similarity_boost: 0.7 },
      }),
    })
    if (!ttsResp.ok) {
      console.error("[api/regulate/tts]", ttsResp.status, await ttsResp.text().catch(() => ""))
      return NextResponse.json(
        { error: "Audio indisponible pour le moment. Mode visuel actif." },
        { status: 502 },
      )
    }
    const buffer = await ttsResp.arrayBuffer()
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "private, max-age=300",
      },
    })
  } catch (e) {
    console.error("[api/regulate/tts]", e)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
