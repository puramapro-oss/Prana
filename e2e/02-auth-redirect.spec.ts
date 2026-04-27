import { test, expect } from "@playwright/test"

const PROTECTED_ROUTES = [
  "/today",
  "/regulate",
  "/lifeos",
  "/lifeos/tasks",
  "/execute",
  "/rooms",
  "/twin",
  "/score",
  "/settings",
  "/settings/billing",
]

test.describe("auth gate — middleware redirects", () => {
  for (const path of PROTECTED_ROUTES) {
    test(`unauthenticated → /login when visiting ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login/)
    })
  }

  test("login page shows magic link + Google", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("button", { name: /google/i }).first()).toBeVisible()
  })
})
