#!/usr/bin/env node
/**
 * Verify Resend domain DNS for `mail.purama.dev`.
 *
 * Calls Resend Domains API:
 *   GET /domains          → list domains and their verification status
 *   POST /domains/:id/verify  → trigger re-verification
 *
 * Idempotent. Prints a structured report:
 *   - DNS records expected (SPF, DKIM, DMARC, MX, return-path)
 *   - Records currently seen by Resend (verified / pending / failed)
 *   - Whether re-verify was triggered
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx node scripts/verify-resend-dns.mjs
 *   RESEND_API_KEY=re_xxx node scripts/verify-resend-dns.mjs --domain mail.purama.dev
 *   RESEND_API_KEY=re_xxx node scripts/verify-resend-dns.mjs --reverify
 *
 * Exit codes:
 *   0 — domain verified
 *   1 — usage / network error
 *   2 — domain pending verification (records present but not yet propagated)
 *   3 — domain failed verification (records missing or wrong)
 */

const RESEND_API = "https://api.resend.com"
const KEY = process.env.RESEND_API_KEY
const args = process.argv.slice(2)
const domain = (() => {
  const i = args.indexOf("--domain")
  return i > -1 ? args[i + 1] : "mail.purama.dev"
})()
const reverify = args.includes("--reverify")

if (!KEY) {
  console.error("Missing RESEND_API_KEY env")
  process.exit(1)
}

async function api(path, init = {}) {
  const res = await fetch(`${RESEND_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  })
  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`)
  }
  return body
}

function fmtRecord(r) {
  const status = r.status === "verified" ? "✓ verified" : r.status === "pending" ? "… pending" : `✗ ${r.status}`
  return `   [${status}]  ${r.record} ${r.name ? `(${r.name})` : ""}`
}

async function main() {
  const list = await api("/domains")
  const domains = list?.data ?? []
  const target = domains.find((d) => d.name === domain)
  if (!target) {
    console.log(`No Resend domain "${domain}" found.`)
    console.log("Create it via dashboard or POST /domains, then re-run this script.")
    process.exit(3)
  }

  console.log(`Resend domain: ${target.name}`)
  console.log(`  id:     ${target.id}`)
  console.log(`  status: ${target.status}`)
  console.log(`  region: ${target.region ?? "n/a"}`)
  if (Array.isArray(target.records)) {
    console.log("  records:")
    target.records.forEach((r) => console.log(fmtRecord(r)))
  }

  if (reverify) {
    console.log(`\nTriggering re-verify…`)
    await api(`/domains/${target.id}/verify`, { method: "POST" })
    console.log("Re-verify queued. Resend will recheck DNS in ~30 seconds.")
  }

  if (target.status === "verified") {
    console.log("\n✓ Domain ready — emails will send from this domain.")
    process.exit(0)
  }
  if (target.status === "pending") {
    console.log("\n… Domain pending — DNS may still be propagating. Run with --reverify in 5 min.")
    process.exit(2)
  }
  console.log("\n✗ Domain failed — check the unverified records above and update DNS.")
  process.exit(3)
}

main().catch((err) => {
  console.error(`\nError: ${err instanceof Error ? err.message : err}`)
  process.exit(1)
})
