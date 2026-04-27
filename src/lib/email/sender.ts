/**
 * PRANA — Email sender (Resend wrapper, dedup, opt-out, locale routing)
 *
 * Public API:
 *  - sendLifecycleEmail({ userId, template, locale, ctx, force? })
 *      → idempotent: if email_log row exists, returns { skipped: true }
 *      → respects profile.notif_prefs.email_enabled (false → skipped)
 *      → service_role only (uses createAdminClient)
 *  - sendEventEmail(...)  → wrapper, force=false by default for events too
 *
 * Never throws on Resend failure: logs to email_log with status=failed.
 * Never sends if RESEND_API_KEY missing (logs warn).
 */

import { Resend } from "resend"
import { createAdminClient } from "@/lib/supabase/admin"
import { log as logger } from "@/lib/log"
import { renderEmail, type EmailTemplate } from "./templates"
import type { Locale } from "@/i18n/config"

const FROM_DEFAULT = "PURAMA ONE <onboarding@mail.purama.dev>"
const REPLY_TO = "matiss.frasne@gmail.com"

let resend: Resend | null = null
function getResend(): Resend | null {
  if (resend) return resend
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  resend = new Resend(key)
  return resend
}

export interface SendResult {
  ok: boolean
  skipped?: boolean
  reason?: string
  resend_id?: string
}

interface SendArgs {
  userId: string
  template: EmailTemplate
  /** Override locale; otherwise read from profile.locale or 'fr'. */
  locale?: Locale
  /** Template-specific extras (firstName auto-populated). */
  ctx?: { extras?: Record<string, string | number> }
  /** Skip dedup check (use for re-engagement only — DEFAULT false). */
  force?: boolean
}

export async function sendLifecycleEmail(args: SendArgs): Promise<SendResult> {
  const admin = createAdminClient()
  const { userId, template, force = false } = args

  // 1) Already sent?
  if (!force) {
    const existing = await admin
      .schema("prana")
      .from("email_log")
      .select("id, status")
      .eq("user_id", userId)
      .eq("template", template)
      .maybeSingle()

    if (existing.data && existing.data.status === "sent") {
      return { ok: true, skipped: true, reason: "already_sent" }
    }
  }

  // 2) Profile (email + display_name + locale + opt-out)
  const profile = await admin
    .from("profiles")
    .select("email, display_name, locale, notif_prefs")
    .eq("id", userId)
    .maybeSingle()

  if (!profile.data || !profile.data.email) {
    return { ok: false, reason: "profile_not_found" }
  }

  const optOut = profile.data.notif_prefs?.email_enabled === false
  if (optOut) {
    await logSent(userId, template, args.locale ?? "fr", "skipped", { reason: "opt_out" })
    return { ok: true, skipped: true, reason: "opt_out" }
  }

  const locale: Locale =
    args.locale ?? (profile.data.locale === "en" ? "en" : "fr")

  // 3) Render
  const rendered = renderEmail(template, locale, {
    firstName: profile.data.display_name ?? null,
    extras: args.ctx?.extras,
  })

  // 4) Send (or stub if RESEND_API_KEY missing)
  const client = getResend()
  if (!client) {
    logger.warn("email.send.no_api_key", { template, userId })
    await logSent(userId, template, locale, "skipped", { reason: "no_api_key" })
    return { ok: false, skipped: true, reason: "no_api_key" }
  }

  try {
    const result = await client.emails.send({
      from: process.env.RESEND_FROM ?? FROM_DEFAULT,
      to: profile.data.email,
      replyTo: REPLY_TO,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      headers: {
        "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_APP_URL ?? "https://prana.purama.dev"}/settings/notifications>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    })
    if (result.error) {
      logger.warn("email.send.resend_error", { template, error: result.error.message })
      await logSent(userId, template, locale, "failed", { error: result.error.message })
      return { ok: false, reason: result.error.message }
    }
    await logSent(userId, template, locale, "sent", { resend_id: result.data?.id })
    return { ok: true, resend_id: result.data?.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown_error"
    logger.warn("email.send.exception", { template, error: msg })
    await logSent(userId, template, locale, "failed", { error: msg })
    return { ok: false, reason: msg }
  }
}

export const sendEventEmail = sendLifecycleEmail

async function logSent(
  userId: string,
  template: EmailTemplate,
  locale: Locale,
  status: "sent" | "failed" | "skipped",
  meta: Record<string, unknown>
): Promise<void> {
  const admin = createAdminClient()
  await admin
    .schema("prana")
    .from("email_log")
    .upsert(
      {
        user_id: userId,
        template,
        locale,
        status,
        resend_id: typeof meta.resend_id === "string" ? meta.resend_id : null,
        meta,
      },
      { onConflict: "user_id,template" }
    )
}
