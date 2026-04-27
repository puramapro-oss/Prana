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

// Probe GoTrue via Kong AND verify it can talk to its DB. /settings is static
// so it only proves "Kong→auth reachable". /admin/users?per_page=1 hits the
// auth.users table — catches the case where gotrue is up but its connection
// pool to Postgres is dead (we hit this on 2026-04-27).
async function checkAuth(): Promise<CheckResult> {
  const t0 = Date.now()
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) return { ok: false, error: "supabase env missing" }
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5_000)
    const res = await fetch(`${url}/auth/v1/admin/users?per_page=1`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      signal: ctrl.signal,
      cache: "no-store",
    })
    clearTimeout(timer)
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return {
        ok: false,
        error: `HTTP ${res.status}${text ? `: ${text.slice(0, 120)}` : ""}`,
        latency_ms: Date.now() - t0,
      }
    }
    return { ok: true, latency_ms: Date.now() - t0 }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" }
  }
}

async function checkAnthropic(): Promise<CheckResult> {
  return { ok: Boolean(process.env.ANTHROPIC_API_KEY) }
}

// Validate the Stripe key by hitting /v1/account. A revoked or rotated key
// would otherwise stay green forever. Webhook secret presence is also checked
// — a literal placeholder still parses as truthy, so we additionally require
// it starts with whsec_.
async function checkStripe(): Promise<CheckResult> {
  const t0 = Date.now()
  const key = process.env.STRIPE_SECRET_KEY
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key) return { ok: false, error: "STRIPE_SECRET_KEY missing" }
  if (!whSecret || !whSecret.startsWith("whsec_")) {
    return { ok: false, error: "STRIPE_WEBHOOK_SECRET missing or placeholder" }
  }
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5_000)
    const res = await fetch("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Bearer ${key.trim()}` },
      signal: ctrl.signal,
      cache: "no-store",
    })
    clearTimeout(timer)
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, latency_ms: Date.now() - t0 }
    return { ok: true, latency_ms: Date.now() - t0 }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" }
  }
}

export async function GET() {
  const [supabase, auth, anthropic, stripe] = await Promise.all([
    checkSupabase(),
    checkAuth(),
    checkAnthropic(),
    checkStripe(),
  ])
  const ok = supabase.ok && auth.ok && anthropic.ok && stripe.ok
  return NextResponse.json(
    {
      ok,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
      env: process.env.VERCEL_ENV ?? "development",
      checks: { supabase, auth, anthropic, stripe },
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  )
}
