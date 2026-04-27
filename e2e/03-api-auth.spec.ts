import { test, expect } from "@playwright/test"

test.describe("API — unauthenticated returns 401", () => {
  const cases: { path: string; method: "GET" | "POST" | "PATCH"; body?: unknown }[] = [
    { path: "/api/agent/pulse-check", method: "POST", body: { stress: 50, energy: 50 } },
    { path: "/api/agent/magic-button", method: "POST", body: { slug: "calm" } },
    { path: "/api/agent/execute", method: "POST", body: { type: "message", situation: "Hello world" } },
    { path: "/api/lifeos/capture", method: "POST", body: { kind: "text", text: "Hello" } },
    { path: "/api/lifeos/plan-7days", method: "POST", body: {} },
    { path: "/api/regulate/protocol", method: "POST", body: { action: "start", protocol_slug: "478" } },
    { path: "/api/regulate/tts", method: "POST", body: { text: "ok" } },
    { path: "/api/rooms/join", method: "POST", body: { slug: "sleep-reset" } },
    { path: "/api/rooms/leave", method: "POST", body: { slug: "sleep-reset" } },
    { path: "/api/rooms", method: "POST", body: {} },
    { path: "/api/safety/event", method: "POST", body: { trigger: "sos_button" } },
    { path: "/api/score/daily", method: "GET" },
    { path: "/api/settings/profile", method: "PATCH", body: { display_name: "x" } },
    { path: "/api/settings/safety", method: "PATCH", body: {} },
    { path: "/api/settings/notifications", method: "PATCH", body: {} },
    { path: "/api/settings/data/export", method: "GET" },
    { path: "/api/stripe/checkout", method: "POST", body: { planId: "starter", cycle: "monthly" } },
    { path: "/api/stripe/portal", method: "POST" },
    { path: "/api/referral/stats", method: "GET" },
  ]

  for (const c of cases) {
    test(`${c.method} ${c.path} → 401`, async ({ request }) => {
      const res =
        c.method === "GET"
          ? await request.get(c.path)
          : c.method === "PATCH"
            ? await request.patch(c.path, { data: c.body })
            : await request.post(c.path, { data: c.body })
      expect(res.status(), await res.text()).toBe(401)
    })
  }
})

test.describe("API — cron routes require Bearer", () => {
  const crons = [
    "/api/cron/daily-score",
    "/api/cron/room-tick",
    "/api/cron/twin-weekly",
    "/api/cron/cash-redistribute",
  ]
  for (const path of crons) {
    test(`${path} without Bearer → 403`, async ({ request }) => {
      const res = await request.get(path)
      expect(res.status()).toBe(403)
    })
  }
})

test.describe("API — Stripe webhook signature required", () => {
  test("POST /api/stripe/webhook without signature → 400", async ({ request }) => {
    const res = await request.post("/api/stripe/webhook", { data: {} })
    expect(res.status()).toBe(400)
  })
})
