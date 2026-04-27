import { test, expect } from "@playwright/test"

test.describe("Security headers", () => {
  test("landing carries CSP + HSTS + X-Frame-Options", async ({ request }) => {
    const r = await request.get("/")
    const h = r.headers()
    expect(h["x-frame-options"]?.toLowerCase()).toBe("deny")
    expect(h["x-content-type-options"]?.toLowerCase()).toBe("nosniff")
    expect(h["strict-transport-security"]).toMatch(/max-age=\d+/)
    expect(h["content-security-policy"]).toMatch(/default-src 'self'/)
    expect(h["content-security-policy"]).toMatch(/frame-ancestors 'none'/)
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin")
  })

  test("powered-by header is removed", async ({ request }) => {
    const r = await request.get("/")
    expect(r.headers()["x-powered-by"]).toBeUndefined()
  })
})
