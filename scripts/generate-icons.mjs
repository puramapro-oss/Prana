#!/usr/bin/env node
/**
 * PRANA — Icon generator (Pollinations API, no sharp dep).
 *
 * Pollinations supports width/height query params, so we ask the API directly
 * for each target size — no client-side resize, no native deps. Idempotent:
 * re-runs overwrite. Does NOT fail the build if Pollinations is down — we just
 * leave existing assets in place.
 *
 * Web targets (public/icons/*):
 *   - icon-192.png    192×192
 *   - icon-512.png    512×512
 *   - icon-maskable-512.png 512×512 (maskable safe zone via prompt instruction)
 *   - apple-touch-icon.png 180×180
 *   - favicon.png     48×48
 *   - og-default.png  1200×630 (used by /api/og fallback)
 *
 * Mobile targets (mobile/assets/*):
 *   - icon.png        1024×1024  (Apple)
 *   - adaptive-icon.png 1024×1024 (Android adaptive foreground)
 *   - splash-icon.png 1284×2778 (iPhone 14 Pro Max splash)
 *   - favicon.png     48×48
 *
 * Usage:
 *   node scripts/generate-icons.mjs              # all
 *   node scripts/generate-icons.mjs --web        # web only
 *   node scripts/generate-icons.mjs --mobile     # mobile only
 *   node scripts/generate-icons.mjs --seed 42    # reproducible run
 */

import { mkdir, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")

const PROMPT_BASE =
  "minimalist sacred geometry lotus symbol, single elegant line art, " +
  "deep purple (#7C3AED) glowing into soft pink (#F472B6), " +
  "centered on pure dark background (#0A0A0F), " +
  "calm meditation aesthetic, app icon, no text, no watermark, " +
  "soft glow, balanced composition, 5% safe margin around the symbol"

const PROMPT_MASKABLE =
  "minimalist sacred geometry lotus symbol, single elegant line art, " +
  "deep purple (#7C3AED) glowing into soft pink (#F472B6), " +
  "centered on pure dark background (#0A0A0F), " +
  "calm meditation aesthetic, app icon, no text, no watermark, " +
  "small symbol with 25% safe zone padding for maskable circle crop"

const PROMPT_SPLASH =
  "abstract calm aurora background, deep dark void (#0A0A0F) with " +
  "subtle vertical gradient of purple (#7C3AED) and pink (#F472B6) glows, " +
  "centered tiny minimalist lotus symbol, meditation app splash screen, " +
  "no text, no watermark, ethereal, breathable space, vertical 9:21"

const PROMPT_OG =
  "16:9 abstract calm landscape, deep dark void (#0A0A0F), " +
  "soft purple (#7C3AED) and pink (#F472B6) aurora gradients, " +
  "subtle minimalist lotus symbol on the left, generous breathing space, " +
  "PURAMA ONE wordmark area on the right (no text rendered), social card aesthetic"

const args = new Set(process.argv.slice(2))
const seedArgIdx = process.argv.indexOf("--seed")
const SEED = seedArgIdx > -1 ? Number(process.argv[seedArgIdx + 1]) : 1729

const TARGETS = [
  // Web PWA
  { kind: "web", file: "public/icons/icon-192.png", w: 192, h: 192, prompt: PROMPT_BASE },
  { kind: "web", file: "public/icons/icon-512.png", w: 512, h: 512, prompt: PROMPT_BASE },
  { kind: "web", file: "public/icons/icon-maskable-512.png", w: 512, h: 512, prompt: PROMPT_MASKABLE },
  { kind: "web", file: "public/icons/apple-touch-icon.png", w: 180, h: 180, prompt: PROMPT_BASE },
  { kind: "web", file: "public/favicon.png", w: 48, h: 48, prompt: PROMPT_BASE },
  { kind: "web", file: "public/og-default.png", w: 1200, h: 630, prompt: PROMPT_OG },
  // Mobile (Expo)
  { kind: "mobile", file: "mobile/assets/icon.png", w: 1024, h: 1024, prompt: PROMPT_BASE },
  { kind: "mobile", file: "mobile/assets/adaptive-icon.png", w: 1024, h: 1024, prompt: PROMPT_MASKABLE },
  { kind: "mobile", file: "mobile/assets/splash-icon.png", w: 1284, h: 2778, prompt: PROMPT_SPLASH },
  { kind: "mobile", file: "mobile/assets/favicon.png", w: 48, h: 48, prompt: PROMPT_BASE },
]

function pollinationsUrl(prompt, w, h, seed) {
  const enc = encodeURIComponent(prompt)
  return `https://image.pollinations.ai/prompt/${enc}?width=${w}&height=${h}&model=flux&seed=${seed}&enhance=true&nologo=true`
}

async function downloadOne(target, attempt = 1) {
  const url = pollinationsUrl(target.prompt, target.w, target.h, SEED + attempt - 1)
  const out = resolve(ROOT, target.file)
  await mkdir(dirname(out), { recursive: true })
  process.stdout.write(`→ ${target.file} (${target.w}×${target.h}) [try ${attempt}]… `)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 180_000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (res.status === 429) throw new Error("HTTP 429 (rate-limited)")
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.byteLength < 1000) throw new Error("payload too small")
    await writeFile(out, buf)
    process.stdout.write(`OK ${(buf.byteLength / 1024).toFixed(0)} KB\n`)
    return true
  } catch (err) {
    process.stdout.write(`FAIL (${err instanceof Error ? err.message : "unknown"})\n`)
    if (attempt < 3) {
      const wait = attempt * 8000
      process.stdout.write(`   retry in ${wait / 1000}s…\n`)
      await new Promise((r) => setTimeout(r, wait))
      return downloadOne(target, attempt + 1)
    }
    if (existsSync(out)) process.stdout.write(`   keeping existing ${target.file}\n`)
    return false
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  const wantWeb = args.has("--web") || (!args.has("--web") && !args.has("--mobile"))
  const wantMobile = args.has("--mobile") || (!args.has("--web") && !args.has("--mobile"))
  const list = TARGETS.filter((t) => (t.kind === "web" ? wantWeb : wantMobile))

  console.log(`PRANA icon generator — seed=${SEED} — ${list.length} targets\n`)

  let okCount = 0
  // Sequential + spacing: Pollinations rate-limits hard.
  for (const target of list) {
    // Skip if already exists and --skip-existing flag.
    const out = resolve(ROOT, target.file)
    if (args.has("--skip-existing") && existsSync(out)) {
      console.log(`→ ${target.file}: already exists, skipped`)
      okCount += 1
      continue
    }
    const ok = await downloadOne(target)
    if (ok) okCount += 1
    // Cool-down between targets: avoids 429 burst.
    await new Promise((r) => setTimeout(r, 2500))
  }
  console.log(`\nDone — ${okCount}/${list.length} downloaded.`)
  if (okCount < list.length) {
    console.log("Re-run later for the failures (existing files were preserved).")
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
