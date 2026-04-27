// Lightweight loader for .env.local — Playwright tests need server env vars
// (SUPABASE_SERVICE_ROLE_KEY) for auth bootstrap. Importing this file from a
// global setup or top-of-spec ensures process.env is hydrated before any
// helper reads it.
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

const path = resolve(process.cwd(), ".env.local")
if (existsSync(path) && !process.env.__PRANA_E2E_ENV_LOADED) {
  const raw = readFileSync(path, "utf8")
  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
  process.env.__PRANA_E2E_ENV_LOADED = "1"
}
