#!/usr/bin/env node
/**
 * Mint a Supabase session for the Maestro test account.
 *
 * Prints the access_token + refresh_token tab-separated to stdout for
 * Maestro CI to capture. Uses a dedicated `e2e+maestro@purama.dev` account
 * with `e2e_role=true` flag to bypass safety quotas in stage env.
 *
 * Required env:
 *   SUPABASE_URL                 (defaults to https://auth.purama.dev)
 *   SUPABASE_ANON_KEY
 *   MAESTRO_TEST_PASSWORD        (set in GitHub Actions secret)
 *
 * Usage in CI:
 *   TOKEN=$(node scripts/maestro-mint-token.mjs)
 *   MAESTRO_E2E_TOKEN=$TOKEN maestro test mobile/.maestro/flows
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://auth.purama.dev"
const ANON = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const EMAIL = process.env.MAESTRO_TEST_EMAIL ?? "e2e+maestro@purama.dev"
const PASSWORD = process.env.MAESTRO_TEST_PASSWORD

if (!ANON) {
  console.error("Missing SUPABASE_ANON_KEY env")
  process.exit(2)
}
if (!PASSWORD) {
  console.error("Missing MAESTRO_TEST_PASSWORD env")
  process.exit(2)
}

async function main() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
    },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    console.error(`Sign-in failed: HTTP ${res.status} ${detail.slice(0, 200)}`)
    process.exit(3)
  }
  const data = await res.json()
  if (!data.access_token || !data.refresh_token) {
    console.error("Response missing tokens", data)
    process.exit(4)
  }
  // Tab-separated so Maestro can split on `${TOKEN%%\\t*}` if needed.
  process.stdout.write(`${data.access_token}\t${data.refresh_token}\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
