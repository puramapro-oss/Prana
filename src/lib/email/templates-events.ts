/**
 * PRANA — Event email templates (3)
 * Extracted from templates.ts to keep files under 300 lines.
 */

import type { Locale } from "@/i18n/config"
import type { RenderedEmail } from "./templates"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://prana.purama.dev"
const COMPANY_FOOTER_FR = `PURAMA · 8 Rue de la Chapelle, 25560 Frasne — France · <a href="${APP_URL}/settings/notifications" style="color:#7C3AED;">Préférences emails</a>`
const COMPANY_FOOTER_EN = `PURAMA · 8 Rue de la Chapelle, 25560 Frasne — France · <a href="${APP_URL}/settings/notifications" style="color:#7C3AED;">Email preferences</a>`

function shell(opts: { locale: Locale; preheader: string; bodyHtml: string }): string {
  const footer = opts.locale === "en" ? COMPANY_FOOTER_EN : COMPANY_FOOTER_FR
  return `<!DOCTYPE html><html lang="${opts.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PURAMA ONE</title></head>
<body style="margin:0;background:#FBFAF7;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Inter,sans-serif;color:#0A0A0F;line-height:1.6;">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;font-size:0;color:#FBFAF7;">${esc(opts.preheader)}</span>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FBFAF7;padding:24px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:16px;border:1px solid rgba(10,10,15,0.06);">
<tr><td style="padding:32px 32px 8px;">
<div style="font-family:Georgia,serif;font-size:18px;letter-spacing:-0.01em;color:#0A0A0F;">PURAMA ONE</div>
</td></tr>
<tr><td style="padding:8px 32px 32px;font-size:15px;color:#0A0A0F;">
${opts.bodyHtml}
</td></tr>
<tr><td style="padding:16px 32px 24px;font-size:12px;color:#6B6B72;text-align:center;border-top:1px solid rgba(10,10,15,0.06);">
${footer}
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;"
  )
}

function btn(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td bgcolor="#0A0A0F" style="border-radius:10px;"><a href="${esc(href)}" style="display:inline-block;padding:12px 24px;color:#FBFAF7;text-decoration:none;font-weight:500;font-size:14px;">${esc(label)}</a></td></tr></table>`
}

interface Ctx {
  appUrl?: string
  extras?: Record<string, string | number>
}

export function renderReferralConverted(locale: Locale, ctx: Ctx): RenderedEmail {
  const url = ctx.appUrl ?? APP_URL
  const refereeName = String(ctx.extras?.referee ?? "")
  if (locale === "en") {
    const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Someone joined thanks to you.</h1>
<p>${refereeName ? esc(refereeName) + " just signed up" : "A friend just signed up"} via your link. <strong>+500 points</strong> to your wallet, +30 days Pro for them.</p>
${btn("View my referrals", `${url}/settings/referral`)}`
    return {
      subject: "+500 points — a referral converted",
      html: shell({ locale, preheader: "Someone joined via your link.", bodyHtml: body }),
      text: `Someone joined via your link. +500 points. ${url}/settings/referral`,
    }
  }
  const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Quelqu'un t'a rejoint.</h1>
<p>${refereeName ? esc(refereeName) + " vient de s'inscrire" : "Un·e ami·e vient de s'inscrire"} via ton lien. <strong>+500 points</strong> sur ton wallet, +30 jours Pro pour iel.</p>
${btn("Voir mes parrainages", `${url}/settings/referral`)}`
  return {
    subject: "+500 points — un parrainage converti",
    html: shell({ locale, preheader: "Quelqu'un t'a rejoint via ton lien.", bodyHtml: body }),
    text: `Quelqu'un t'a rejoint. +500 points. ${url}/settings/referral`,
  }
}

export function renderRoomDay1(locale: Locale, ctx: Ctx): RenderedEmail {
  const url = ctx.appUrl ?? APP_URL
  const roomName = String(ctx.extras?.roomName ?? (locale === "en" ? "your room" : "ta room"))
  if (locale === "en") {
    const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Day 1 — ${esc(roomName)}.</h1>
<p>Today's micro-action is waiting. 5 minutes max. Don't think — open it.</p>
${btn("Open the room", `${url}/rooms`)}`
    return {
      subject: `Day 1 — ${roomName}`,
      html: shell({ locale, preheader: "Today's micro-action is ready.", bodyHtml: body }),
      text: `Day 1 micro-action: ${url}/rooms`,
    }
  }
  const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Jour 1 — ${esc(roomName)}.</h1>
<p>Ta micro-action du jour t'attend. 5 minutes max. Ne réfléchis pas — ouvre.</p>
${btn("Ouvrir la room", `${url}/rooms`)}`
  return {
    subject: `Jour 1 — ${roomName}`,
    html: shell({ locale, preheader: "Ta micro-action du jour est prête.", bodyHtml: body }),
    text: `Jour 1 micro-action : ${url}/rooms`,
  }
}

export function renderProtocolStreak(locale: Locale, ctx: Ctx): RenderedEmail {
  const url = ctx.appUrl ?? APP_URL
  const days = Number(ctx.extras?.days ?? 7)
  if (locale === "en") {
    const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">${days} days in a row.</h1>
<p>You regulated ${days} days straight. That's not nothing — that's a nervous system trained.</p>
${btn("See my score", `${url}/score`)}`
    return {
      subject: `${days}-day streak — you trained your system`,
      html: shell({ locale, preheader: `${days} days regulated.`, bodyHtml: body }),
      text: `${days} days regulated. ${url}/score`,
    }
  }
  const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">${days} jours d'affilée.</h1>
<p>Tu as régulé ${days} jours d'affilée. C'est pas rien — c'est un système nerveux entraîné.</p>
${btn("Voir mon score", `${url}/score`)}`
  return {
    subject: `${days} jours d'affilée — bravo`,
    html: shell({ locale, preheader: `${days} jours régulés.`, bodyHtml: body }),
    text: `${days} jours régulés. ${url}/score`,
  }
}
