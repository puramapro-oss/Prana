import { test, expect } from "@playwright/test"

test.describe("Referral cookie planting (/ref/[code])", () => {
  test("/ref/<code> sets prana_ref cookie", async ({ page, context }) => {
    await page.goto("/ref/TESTCODE")
    // L'interstitial 200 redirige en JS vers /signup. On laisse le temps de planter le cookie.
    await page.waitForLoadState("domcontentloaded")
    const cookies = await context.cookies()
    const ref = cookies.find((c) => c.name === "prana_ref")
    expect(ref).toBeTruthy()
    expect(ref?.value).toBe("TESTCODE")
  })

  test("/ref/<code> redirige vers /signup", async ({ page }) => {
    await page.goto("/ref/TESTCODE")
    await page.waitForURL(/\/signup/, { timeout: 5_000 })
    expect(page.url()).toContain("/signup")
  })
})
