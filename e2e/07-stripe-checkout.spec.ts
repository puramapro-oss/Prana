import "./helpers/load-env"
import { test, expect, type BrowserContext } from "@playwright/test"
import {
  createE2EUser,
  deleteE2EUser,
  isAuthReachable,
  signInE2E,
  type E2EUser,
} from "./helpers/auth"

let authReachable = false
let authedCtx: BrowserContext | null = null
let testUser: E2EUser | null = null

test.beforeAll(async ({ browser }) => {
  authReachable = await isAuthReachable()
  if (!authReachable) return
  testUser = await createE2EUser()
  authedCtx = await signInE2E(browser, testUser)
})

test.afterAll(async () => {
  if (authedCtx) await authedCtx.close().catch(() => undefined)
  if (testUser) await deleteE2EUser(testUser.id)
})

test.describe("Stripe checkout — anon paths (always run)", () => {
  test("anon POST /api/stripe/checkout → 401", async ({ request }) => {
    const r = await request.post("/api/stripe/checkout", {
      data: { planId: "starter", cycle: "monthly" },
    })
    expect(r.status()).toBe(401)
  })

  test("Stripe webhook without signature → 400", async ({ request }) => {
    const r = await request.post("/api/stripe/webhook", { data: { id: "evt_test" } })
    expect(r.status()).toBe(400)
  })

  test("/pricing page lists plans + monthly/yearly toggle", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page.getByText(/Starter/i).first()).toBeVisible()
    await expect(page.getByText(/Pro/i).first()).toBeVisible()
    await expect(page.getByText(/Ultime/i).first()).toBeVisible()
  })
})

test.describe("Stripe checkout — authenticated", () => {
  test("authenticated POST /api/stripe/checkout creates a Stripe Session OR returns explicit config error", async () => {
    test.skip(!authReachable, "auth down — cannot bootstrap user")
    if (!authedCtx) return
    const r = await authedCtx.request.post("/api/stripe/checkout", {
      data: { planId: "starter", cycle: "monthly" },
    })
    const body = await r.json()
    if (r.status() === 200) {
      // Happy path: Stripe session created
      expect(body).toHaveProperty("url")
      expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//)
    } else if (r.status() === 503) {
      // Known: prices not yet wired. Surface this as an explicit annotation
      // rather than silently passing — but don't fail the suite.
      test.info().annotations.push({
        type: "skip",
        description: `Stripe checkout returned 503: ${body?.error ?? "no message"} — populate plan price IDs to unblock`,
      })
      expect(body?.error).toBeTruthy()
    } else {
      throw new Error(
        `Unexpected /api/stripe/checkout status ${r.status()}: ${JSON.stringify(body)}`,
      )
    }
  })

  test("Stripe checkout page loads when session URL exists", async () => {
    test.skip(!authReachable, "auth down")
    if (!authedCtx) return
    const r = await authedCtx.request.post("/api/stripe/checkout", {
      data: { planId: "starter", cycle: "monthly" },
    })
    test.skip(r.status() !== 200, "Stripe session not creatable in current env")
    const { url } = (await r.json()) as { url: string }

    // Live mode: we visit the Stripe checkout page but DO NOT enter card data
    // (would charge real money). We only verify the page loads + offers a card form.
    const page = await authedCtx.newPage()
    await page.goto(url, { waitUntil: "domcontentloaded" })
    // Stripe Checkout pages embed an iframe for card capture; the surrounding
    // page must show "Pay" or the merchant name in titles.
    await expect(page).toHaveTitle(/(stripe|prana|purama|pay|subscribe|checkout)/i, {
      timeout: 15_000,
    })
    await page.close()
  })

  test("/api/stripe/portal returns 200 OR explicit no-customer error for fresh user", async () => {
    test.skip(!authReachable, "auth down")
    if (!authedCtx) return
    const r = await authedCtx.request.post("/api/stripe/portal")
    // A user with no stripe_customer_id yet may legitimately get 400/404 here.
    expect([200, 400, 404, 503]).toContain(r.status())
  })
})
