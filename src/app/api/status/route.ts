import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface CheckResult {
  ok: boolean
  latency_ms?: number
  error?: string
}

async function checkSupabase(): Promise<CheckResult> {
  const t0 = Date.now()
  try {
    const admin = createAdminClient()
    const { error } = await admin.from("rooms").select("id", { count: "exact", head: true }).limit(1)
    if (error) return { ok: false, error: error.message }
    return { ok: true, latency_ms: Date.now() - t0 }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" }
  }
}

async function checkAnthropic(): Promise<CheckResult> {
  return { ok: Boolean(process.env.ANTHROPIC_API_KEY) }
}

async function checkStripe(): Promise<CheckResult> {
  return { ok: Boolean(process.env.STRIPE_SECRET_KEY) && Boolean(process.env.STRIPE_WEBHOOK_SECRET) }
}

export async function GET() {
  const [supabase, anthropic, stripe] = await Promise.all([
    checkSupabase(),
    checkAnthropic(),
    checkStripe(),
  ])
  const ok = supabase.ok && anthropic.ok && stripe.ok
  return NextResponse.json(
    {
      ok,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
      env: process.env.VERCEL_ENV ?? "development",
      checks: { supabase, anthropic, stripe },
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  )
}
