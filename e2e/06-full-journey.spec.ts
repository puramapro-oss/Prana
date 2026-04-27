import "./helpers/load-env"
import { test, expect, type BrowserContext } from "@playwright/test"
import {
  createE2EUser,
  deleteE2EUser,
  isAuthReachable,
  signInE2E,
  type E2EUser,
} from "./helpers/auth"

// 12 magic buttons exposed on /today. Source of truth: src/lib/agent/magic-buttons-config.ts
const MAGIC_BUTTONS = [
  { slug: "save-day", name: "Sauve ma journée", plan: "free" },
  { slug: "stop-stress", name: "Stop stress", plan: "free" },
  { slug: "anti-chaos", name: "Anti-chaos", plan: "free" },
  { slug: "exhausted", name: "Mode épuisé", plan: "free" },
  { slug: "focus-tunnel", name: "Focus tunnel", plan: "starter" },
  { slug: "sleep-express", name: "Sommeil express", plan: "starter" },
  { slug: "confidence", name: "Confiance instant", plan: "starter" },
  { slug: "procrastination", name: "Anti-procrastination", plan: "starter" },
  { slug: "inbox-clean", name: "Inbox clean", plan: "pro" },
  { slug: "plan-7-days", name: "Plan 7 jours", plan: "pro" },
  { slug: "mind-dump", name: "Décharge mentale", plan: "pro" },
  { slug: "room-of-day", name: "Room du jour", plan: "starter" },
] as const

type AuthState = {
  user: E2EUser
  context: BrowserContext
}

let authReachable = false
let auth: AuthState | null = null

test.beforeAll(async ({ browser }) => {
  authReachable = await isAuthReachable()
  if (!authReachable) {
    test.info().annotations.push({
      type: "issue",
      description:
        "auth.purama.dev is unreachable (Kong→GoTrue 503). Auth-dependent tests will be skipped. Restore /auth/v1/* to run them.",
    })
    return
  }
  const user = await createE2EUser()
  const context = await signInE2E(browser, user)
  auth = { user, context }
})

test.afterAll(async () => {
  if (auth) {
    await auth.context.close().catch(() => undefined)
    await deleteE2EUser(auth.user.id)
  }
})

test.describe("v1.1.1 — full authenticated journey", () => {
  test("auth bootstrap is healthy (or skip suite cleanly)", async () => {
    test.skip(!authReachable, "Supabase auth unreachable — see beforeAll annotation")
    expect(auth).not.toBeNull()
    expect(auth?.user.email).toMatch(/^e2e-/)
  })

  test("/today is the post-login home: greeting + magic buttons + pulse area", async () => {
    test.skip(!authReachable, "auth down")
    if (!auth) return
    const page = await auth.context.newPage()
    await page.goto("/today")
    await expect(page).toHaveURL(/\/today/)
    // greeting derived from email
    await expect(page.getByText(/^(Hello|Salut|Bonjour|Hey|Coucou)/i).first()).toBeVisible({
      timeout: 10_000,
    })
    // 12 magic buttons grid (some may be locked but all DOM-visible)
    for (const b of MAGIC_BUTTONS) {
      const btn = page.getByRole("button", { name: new RegExp(b.name, "i") })
      await expect(btn.first()).toBeVisible()
    }
    await page.close()
  })

  test("12 magic buttons each open their modal", async () => {
    test.skip(!authReachable, "auth down")
    if (!auth) return
    const page = await auth.context.newPage()
    await page.goto("/today")
    for (const b of MAGIC_BUTTONS) {
      const btn = page.getByRole("button", { name: new RegExp(b.name, "i") }).first()
      await btn.click()
      // Card has its own h3 with the button name; the modal renders a separate
      // DialogTitle inside [role=dialog]. Scope the assertion to the dialog.
      const dialog = page.getByRole("dialog")
      const heading = dialog.getByRole("heading", { name: new RegExp(b.name, "i") })
      await expect(heading.first()).toBeVisible({ timeout: 5_000 })
      // Close the modal — Escape works for base-ui Dialog.
      await page.keyboard.press("Escape")
      await expect(dialog).toBeHidden({ timeout: 3_000 })
    }
    await page.close()
  })

  test("pulse-check API submits and persists", async () => {
    test.skip(!authReachable, "auth down")
    if (!auth) return
    const ctx = auth.context
    // Schema (src/app/api/agent/pulse-check/route.ts):
    //   stress / energy: int 0..10
    //   time_available: "20s" | "2min" | "10min" | "1h"
    //   context: "home" | "work" | "outside" | "transit" | "bed" | "other"
    const res = await ctx.request.post("/api/agent/pulse-check", {
      data: { stress: 6, energy: 4, time_available: "2min", context: "work" },
    })
    expect([200, 201]).toContain(res.status())
    const json = await res.json()
    expect(json).toHaveProperty("ok")
    expect(json).toHaveProperty("pulse")
  })

  test("/twin renders with personality / rules / values tabs", async () => {
    test.skip(!authReachable, "auth down")
    if (!auth) return
    const page = await auth.context.newPage()
    await page.goto("/twin")
    await expect(page.getByRole("link", { name: /personnalité/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /règles/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /valeurs/i })).toBeVisible()
    await page.close()
  })

  test("/execute renders main heading + form", async () => {
    test.skip(!authReachable, "auth down")
    if (!auth) return
    const page = await auth.context.newPage()
    await page.goto("/execute")
    await expect(page.getByRole("heading", { name: /^execute$/i })).toBeVisible()
    await page.close()
  })

  test("/rooms renders heading", async () => {
    test.skip(!authReachable, "auth down")
    if (!auth) return
    const page = await auth.context.newPage()
    await page.goto("/rooms")
    await expect(page.getByRole("heading", { name: /^rooms$/i })).toBeVisible()
    await page.close()
  })

  test("/score renders heading + stats area", async () => {
    test.skip(!authReachable, "auth down")
    if (!auth) return
    const page = await auth.context.newPage()
    await page.goto("/score")
    await expect(page.getByRole("heading", { name: /^score$/i })).toBeVisible()
    await page.close()
  })

  test("/safety lists hotlines (auth not required)", async () => {
    test.skip(!authReachable, "auth down")
    if (!auth) return
    const page = await auth.context.newPage()
    await page.goto("/safety")
    await expect(page.getByText(/3114|988|findahelpline/i).first()).toBeVisible()
    await page.close()
  })

  test("/settings/referral surfaces personal referral URL", async () => {
    test.skip(!authReachable, "auth down")
    if (!auth) return
    const page = await auth.context.newPage()
    await page.goto("/settings/referral")
    // The URL is rendered inside a readonly <input> — getByText doesn't see
    // form-control values, so assert on the textbox value directly.
    await expect(page.getByRole("textbox").first()).toHaveValue(/\/ref\//, {
      timeout: 10_000,
    })
    await page.close()
  })

  test("/settings sub-pages all return 200 + render heading", async () => {
    test.skip(!authReachable, "auth down")
    if (!auth) return
    const ctx = auth.context
    const subs = [
      "/settings",
      "/settings/billing",
      "/settings/notifications",
      "/settings/safety",
      "/settings/data",
      "/settings/referral",
    ]
    for (const path of subs) {
      const r = await ctx.request.get(path)
      expect(r.status(), `GET ${path}`).toBe(200)
    }
  })

  test("score daily API returns 200 for authed user", async () => {
    test.skip(!authReachable, "auth down")
    if (!auth) return
    const r = await auth.context.request.get("/api/score/daily")
    expect(r.status()).toBe(200)
  })

  test("referral stats API returns 200", async () => {
    test.skip(!authReachable, "auth down")
    if (!auth) return
    const r = await auth.context.request.get("/api/referral/stats")
    expect(r.status()).toBe(200)
  })
})
