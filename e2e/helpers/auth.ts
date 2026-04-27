import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Browser, BrowserContext } from "@playwright/test"

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://auth.purama.dev"
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const APP_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? "https://prana.purama.dev"

export interface E2EUser {
  id: string
  email: string
  password: string
}

export function adminClient(): SupabaseClient {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY missing — load .env.local before running E2E.",
    )
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Probe whether GoTrue is reachable. Some test paths bootstrap users via the
 * admin API; if Kong→auth is broken (returns 503 "name resolution failed")
 * we skip the auth-dependent tests rather than fail with confusing errors.
 */
export async function isAuthReachable(): Promise<boolean> {
  if (!SUPABASE_ANON_KEY) return false
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 5_000)
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      signal: ctrl.signal,
      cache: "no-store",
    })
    clearTimeout(t)
    return res.ok
  } catch {
    return false
  }
}

/**
 * Create a confirmed E2E user via service_role admin API.
 * Email is throwaway (e2e-<ts>-<rand>@purama.dev) so a new identity is used
 * for every run. Caller is responsible for cleanup via deleteE2EUser.
 */
export async function createE2EUser(): Promise<E2EUser> {
  const admin = adminClient()
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 8)
  const email = `e2e-${ts}-${rand}@purama.dev`
  const password = `PranaE2E-${ts}!`

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "E2E Test User" },
  })
  if (error) throw error
  if (!data.user) throw new Error("createUser returned no user")
  return { id: data.user.id, email, password }
}

export async function deleteE2EUser(userId: string): Promise<void> {
  const admin = adminClient()
  // Best-effort delete. RLS-cascaded rows go too via FK ON DELETE CASCADE.
  await admin.auth.admin.deleteUser(userId).catch(() => undefined)
}

/**
 * Sign in to /login by visiting an admin-generated magic link. After Supabase
 * redirects through /auth/callback, SSR cookies are planted on the context.
 * Returns the authenticated BrowserContext + user.
 */
export async function signInE2E(
  browser: Browser,
  user: E2EUser,
): Promise<BrowserContext> {
  const admin = adminClient()
  const next = "/today"
  const redirectTo = `${APP_URL}/auth/callback?next=${encodeURIComponent(next)}`

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: user.email,
    options: { redirectTo },
  })
  if (error) throw error
  const link = data.properties?.action_link
  if (!link) throw new Error("generateLink returned no action_link")

  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(link, { waitUntil: "domcontentloaded" })
  // Supabase redirects to /auth/callback?code=… → exchanges code → cookies planted
  await page.waitForURL(/\/today(\?|$)/, { timeout: 30_000 })
  await page.close()
  return ctx
}
