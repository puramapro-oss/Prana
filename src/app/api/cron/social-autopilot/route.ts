import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { generatePost, pickThemeForToday } from "@/lib/social/content"
import { publishToSocial, type SocialPlatform } from "@/lib/social/zernio"

export const runtime = "nodejs"
export const maxDuration = 60

const DEFAULT_PLATFORMS: SocialPlatform[] = ["x", "linkedin", "threads", "bluesky"]

/**
 * CRON social-autopilot — runs Mon/Wed/Fri 10:00 UTC.
 *
 * 1. Pick a theme deterministically from the current week×day.
 * 2. Ask haiku-4-5 for FR+EN caption + image prompt.
 * 3. Pollinations URL for image.
 * 4. Publish via Zernio (X / LinkedIn / Threads / Bluesky).
 * 5. Persist post + per-platform results in prana.social_posts.
 *
 * Auth : Bearer CRON_SECRET (matches other prana crons).
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const auth = req.headers.get("authorization") ?? ""
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else if (!req.headers.get("x-vercel-cron")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const startedAt = Date.now()

  // 1) Generate
  let post
  try {
    const theme = pickThemeForToday()
    post = await generatePost(theme)
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "generate", error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    )
  }

  // 2) Publish
  const fullCaptionFr = post.hashtags.length
    ? `${post.captionFr}\n\n${post.hashtags.map((h) => `#${h}`).join(" ")}`
    : post.captionFr

  const results = await publishToSocial({
    caption: fullCaptionFr,
    hashtags: post.hashtags,
    imageUrl: post.imageUrl,
    platforms: DEFAULT_PLATFORMS,
  })

  const sent = results.filter((r) => r.success).length
  const failed = results.length - sent
  const status = sent === 0 ? "failed" : failed === 0 ? "sent" : "partial"

  // 3) Persist (best-effort)
  const admin = createAdminClient()
  const insert = await admin
    .schema("prana")
    .from("social_posts")
    .insert({
      theme: post.theme,
      caption_fr: post.captionFr,
      caption_en: post.captionEn,
      hashtags: post.hashtags,
      image_url: post.imageUrl,
      platforms: DEFAULT_PLATFORMS,
      status,
      zernio_results: results,
      sent_at: new Date().toISOString(),
    })
    .select("id")
    .maybeSingle()

  return NextResponse.json({
    ok: status !== "failed",
    duration_ms: Date.now() - startedAt,
    post_id: insert.data?.id ?? null,
    theme: post.theme,
    status,
    platforms: DEFAULT_PLATFORMS,
    results,
  })
}
