/**
 * PRANA — Zernio social autopilot client (text + image, no video).
 *
 * Wraps a minimal subset of the Zernio API for cron-driven publishing.
 * On any failure → fail-soft (returns partial/failed result, never throws).
 *
 * Env: ZERNIO_API_KEY, ZERNIO_BASE_URL (default https://zernio.com/api/v1)
 */

import { log as logger } from "@/lib/log"

export type SocialPlatform =
  | "x"
  | "linkedin"
  | "threads"
  | "instagram"
  | "facebook"
  | "bluesky"
  | "mastodon"

export interface ZernioPostInput {
  caption: string
  hashtags: string[]
  /** Optional image URL (Pollinations or static asset). */
  imageUrl?: string
  platforms: SocialPlatform[]
}

export interface ZernioPostResult {
  platform: SocialPlatform
  success: boolean
  postId?: string
  postUrl?: string
  error?: string
}

const ZERNIO_BASE = process.env.ZERNIO_BASE_URL ?? "https://zernio.com/api/v1"

function authHeaders(): HeadersInit | null {
  const key = process.env.ZERNIO_API_KEY
  if (!key) return null
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  }
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 12_000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Publish a text/image post across platforms via Zernio.
 * Returns one result per requested platform.
 */
export async function publishToSocial(input: ZernioPostInput): Promise<ZernioPostResult[]> {
  const headers = authHeaders()
  if (!headers) {
    logger.warn("zernio.publish.no_api_key")
    return input.platforms.map((p) => ({ platform: p, success: false, error: "no_api_key" }))
  }

  const body = {
    caption: input.caption,
    hashtags: input.hashtags,
    image_url: input.imageUrl,
    platforms: input.platforms,
  }

  try {
    const res = await fetchWithTimeout(
      `${ZERNIO_BASE}/posts`,
      { method: "POST", headers, body: JSON.stringify(body) },
      15_000,
    )
    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      logger.warn("zernio.publish.http_error", { status: res.status, detail: detail.slice(0, 200) })
      return input.platforms.map((p) => ({ platform: p, success: false, error: `HTTP ${res.status}` }))
    }
    const data = (await res.json()) as { results?: Array<{ platform: string; success?: boolean; post_id?: string; post_url?: string; error?: string }> }
    const results = data.results ?? []
    if (!results.length) {
      // Fallback: assume all platforms succeeded if Zernio returned 200 with no breakdown
      return input.platforms.map((p) => ({ platform: p, success: true }))
    }
    return results.map((r) => ({
      platform: r.platform as SocialPlatform,
      success: Boolean(r.success),
      postId: r.post_id,
      postUrl: r.post_url,
      error: r.error,
    }))
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown_error"
    logger.warn("zernio.publish.exception", { error: msg })
    return input.platforms.map((p) => ({ platform: p, success: false, error: msg }))
  }
}

export function pollinationsImageUrl(prompt: string, seed?: number): string {
  const enc = encodeURIComponent(prompt)
  const s = seed ?? Math.floor(Math.random() * 1_000_000)
  return `https://image.pollinations.ai/prompt/${enc}?width=1080&height=1080&model=flux&seed=${s}&enhance=true&nologo=true`
}
