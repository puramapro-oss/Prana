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
 * Probe whether GoTrue is reachable AND can talk to its DB. The /settings
 * endpoint is static config and only proves "Kong→auth route works" — it
 * stays green even when gotrue's connection pool to Postgres is dead. We
 * also hit /admin/users?per_page=1 (read path against auth.users) so that
 * E2E tests skip cleanly when a write to auth.users would fail with the
 * same "Database error creating new user" we saw in prod on 2026-04-27.
 */
export async function isAuthReachable(): Promise<boolean> {
  if (!SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) return false
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 5_000)
    const settingsRes = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      signal: ctrl.signal,
      cache: "no-store",
    })
    if (!settingsRes.ok) {
      clearTimeout(t)
      return false
    }
    const adminRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?per_page=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        signal: ctrl.signal,
        cache: "no-store",
      },
    )
    clearTimeout(t)
    return adminRes.ok
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
 * Sign in by exchanging email+password for a session, then injecting the
 * Supabase SSR cookie directly into the BrowserContext.
 *
 * We avoid the magic-link flow because admin.generateLink emits an implicit-
 * grant URL (`#access_token=…` in the fragment) that our /auth/callback
 * route — which only accepts `?code=…` from PKCE — will reject with
 * `error=missing_code`.
 *
 * Cookie format follows @supabase/ssr v0.5+ which uses base64-prefixed,
 * URL-encoded JSON (or the chunked variant with `.0`/`.1` suffixes if the
 * value exceeds the chunk size). We always use the single-cookie form here:
 * the session payload is small enough.
 */
export async function signInE2E(
  browser: Browser,
  user: E2EUser,
): Promise<BrowserContext> {
  if (!SUPABASE_ANON_KEY) throw new Error("anon key missing")

  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await anon.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  })
  if (error) throw error
  if (!data.session) throw new Error("signInWithPassword returned no session")

  const session = data.session
  // @supabase/ssr cookie payload — same shape it writes itself.
  const payload = {
    access_token: session.access_token,
    token_type: session.token_type,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    refresh_token: session.refresh_token,
    user: session.user,
  }
  const json = JSON.stringify(payload)
  const cookieValue = "base64-" + Buffer.from(json, "utf8").toString("base64")

  const url = new URL(SUPABASE_URL)
  const projectRef = url.hostname.split(".")[0]
  const cookieName = `sb-${projectRef}-auth-token`

  const appHost = new URL(APP_URL).hostname

  const ctx = await browser.newContext()
  await ctx.addCookies([
    {
      name: cookieName,
      value: cookieValue,
      domain: appHost,
      path: "/",
      httpOnly: false,
      secure: true,
      sameSite: "Lax",
      expires: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
    },
  ])
  return ctx
}
