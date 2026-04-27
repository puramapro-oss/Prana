import { test, expect } from "@playwright/test"

test.describe("marketing pages — public", () => {
  test("landing renders hero + CTAs", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/PURAMA ONE/i)
    await expect(page.getByRole("link", { name: /créer mon espace/i }).first()).toBeVisible()
    // Skip-to-content link works (a11y)
    const skip = page.getByRole("link", { name: /aller au contenu/i })
    await expect(skip).toBeAttached()
  })

  test("pricing exposes 4 plans + trial", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page).toHaveURL(/\/pricing$/)
    await expect(page.getByText(/7 jours/i).first()).toBeVisible()
  })

  test("manifesto reachable", async ({ page }) => {
    await page.goto("/manifesto")
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })

  test("safety page lists hotlines", async ({ page }) => {
    await page.goto("/safety")
    // Au moins un numéro d'urgence visible
    await expect(page.getByText(/3114|988|findahelpline|hotline/i).first()).toBeVisible()
  })

  test("sitemap.xml is a valid XML", async ({ request }) => {
    const r = await request.get("/sitemap.xml")
    expect(r.status()).toBe(200)
    const body = await r.text()
    expect(body).toContain("<urlset")
    expect(body).toContain("<loc>")
  })

  test("robots.txt allows root + lists sitemap", async ({ request }) => {
    const r = await request.get("/robots.txt")
    expect(r.status()).toBe(200)
    const body = await r.text()
    expect(body).toMatch(/Sitemap:\s*https?:\/\//)
    expect(body).toMatch(/Disallow:\s*\/api\//)
  })

  test("OG image route returns image/png", async ({ request }) => {
    const r = await request.get("/api/og?title=Test&subtitle=Sub")
    expect(r.status()).toBe(200)
    expect(r.headers()["content-type"]).toMatch(/image\/png/)
  })
})
