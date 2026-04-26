import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { apiLimiter } from "@/lib/upstash"
import { checkDailyQuota } from "@/lib/quotas"
import { transcribeAudio } from "@/lib/agent/openai-whisper"
import { classifyForSafety } from "@/lib/safety/classifier"
import { logSafetyEvent, escalationHint } from "@/lib/safety/escalation"
import { classifyCapture } from "@/lib/lifeos/classifier-runner"
import type {
  Capture,
  CaptureSource,
  Plan,
  Profile,
} from "@/lib/supabase/types"

export const runtime = "nodejs"

const TextSchema = z.object({
  source: z.enum(["text", "share"]),
  raw_text: z.string().min(1).max(4000),
})

const MAX_AUDIO_BYTES = 25 * 1024 * 1024 // 25 MB (whisper limit)
const MAX_TEXT_LEN = 4000

interface CaptureResultPayload {
  ok: true
  capture: { id: string; raw_text: string; source: CaptureSource }
  classification_pending: boolean
  safetyRedirect: string | null
  quota: { used: number; limit: number; unlimited: boolean }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Connecte-toi pour capturer." },
        { status: 401 },
      )
    }

    const limit = await apiLimiter.limit(user.id)
    if (!limit.success) {
      return NextResponse.json(
        { error: "Trop de captures rapprochées. Pose-toi une minute." },
        { status: 429 },
      )
    }

    const profileResp = await supabase
      .from("profiles")
      .select("plan, locale")
      .eq("id", user.id)
      .maybeSingle()
    const profile = profileResp.data as Pick<Profile, "plan" | "locale"> | null
    const userPlan: Plan = profile?.plan ?? "free"

    const quota = await checkDailyQuota(user.id, userPlan, "captures")
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Tu as atteint ta capture du jour (plan ${userPlan}). Reviens demain ou passe en plan supérieur.`,
          quotaReached: true,
          used: quota.used,
          limit: quota.limit,
        },
        { status: 402 },
      )
    }

    let rawText = ""
    let source: CaptureSource = "text"
    const audioUrl: string | null = null

    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData()
      const audio = form.get("audio")
      const fallbackText = form.get("raw_text")
      const declaredSource = form.get("source")

      if (audio instanceof Blob && audio.size > 0) {
        if (audio.size > MAX_AUDIO_BYTES) {
          return NextResponse.json(
            { error: "Enregistrement trop long. Max 60 secondes." },
            { status: 413 },
          )
        }
        try {
          const transcript = await transcribeAudio(audio, "capture.webm")
          rawText = transcript.trim().slice(0, MAX_TEXT_LEN)
        } catch (err) {
          console.error("[capture] whisper", err)
          return NextResponse.json(
            { error: "La transcription a échoué. Réessaie en parlant un peu plus fort." },
            { status: 502 },
          )
        }
        source = "voice"
      } else if (typeof fallbackText === "string" && fallbackText.trim().length > 0) {
        rawText = fallbackText.trim().slice(0, MAX_TEXT_LEN)
        source =
          declaredSource === "share" || declaredSource === "image"
            ? (declaredSource as CaptureSource)
            : "text"
      } else {
        return NextResponse.json(
          { error: "Capture vide. Dis ou écris quelque chose." },
          { status: 400 },
        )
      }
    } else {
      const body = await req.json().catch(() => null)
      const parsed = TextSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Données invalides.", details: parsed.error.flatten() },
          { status: 400 },
        )
      }
      rawText = parsed.data.raw_text.trim().slice(0, MAX_TEXT_LEN)
      source = parsed.data.source
    }

    if (rawText.length === 0) {
      return NextResponse.json(
        { error: "Capture vide après nettoyage." },
        { status: 400 },
      )
    }

    // Safety classifier — if force_sos, we still record but flag the redirect
    let safetyRedirect: string | null = null
    const safety = await classifyForSafety(rawText)
    if (safety.action === "force_sos" || safety.action === "show_sos") {
      await logSafetyEvent({
        userId: user.id,
        trigger: "classifier_flag",
        result: safety,
        contextText: rawText,
      })
      safetyRedirect = escalationHint(safety)?.redirect ?? null
    }

    // Insert via authenticated client (RLS enforced)
    const insertResp = await supabase
      .from("captures")
      .insert({
        user_id: user.id,
        raw_text: rawText,
        source,
        audio_url: audioUrl,
      })
      .select("id, raw_text, source")
      .maybeSingle()

    const insertedCapture = insertResp.data as Pick<
      Capture,
      "id" | "raw_text" | "source"
    > | null

    if (insertResp.error || !insertedCapture) {
      console.error("[capture] insert", insertResp.error)
      return NextResponse.json(
        { error: "Impossible d'enregistrer la capture. Réessaie." },
        { status: 500 },
      )
    }

    // Fire-and-forget classification (we don't await — UI shows pending state)
    void classifyCaptureAsync(insertedCapture.id)

    const payload: CaptureResultPayload = {
      ok: true,
      capture: insertedCapture,
      classification_pending: true,
      safetyRedirect,
      quota: {
        used: quota.used + 1,
        limit: quota.limit,
        unlimited: quota.unlimited,
      },
    }

    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/lifeos/capture]", e)
    return NextResponse.json(
      { error: "Une erreur est survenue. Réessaie dans un instant." },
      { status: 500 },
    )
  }
}

/** Run classifier in the background. Catches errors so they don't crash the response cycle. */
async function classifyCaptureAsync(captureId: string) {
  try {
    await classifyCapture(captureId)
  } catch (err) {
    console.error("[capture] async classify", captureId, err)
  }
}

/** Optional debug GET — admin can re-trigger classification for a capture. */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non connecté." }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const Schema = z.object({ id: z.string().uuid() })
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
    }

    // Reclassify only if owner
    const admin = createAdminClient()
    const ownerCheck = await admin
      .from("captures")
      .select("user_id")
      .eq("id", parsed.data.id)
      .maybeSingle()
    const owner = (ownerCheck.data as { user_id: string } | null)?.user_id
    if (owner !== user.id) {
      return NextResponse.json({ error: "Capture introuvable." }, { status: 404 })
    }

    // Reset classification then run again
    await admin
      .from("captures")
      .update({ classification: null, classified_at: null, archived: false })
      .eq("id", parsed.data.id)

    const result = await classifyCapture(parsed.data.id)
    return NextResponse.json(result)
  } catch (e) {
    console.error("[api/lifeos/capture PATCH]", e)
    return NextResponse.json(
      { error: "Reclassification impossible." },
      { status: 500 },
    )
  }
}
