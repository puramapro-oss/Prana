/**
 * PRANA — Email lifecycle templates (10)
 *
 * 7 sequence templates (cron-driven, age-based):
 *   welcome (J0), day1_tip, day3_nudge, day7_tips, day14_upgrade, day21_testimonial, day30_winback
 *
 * 3 event templates (inline-triggered):
 *   referral_converted, room_day1, protocol_streak
 *
 * Bilingual : FR (default) + EN, picked from profile.locale or fallback.
 *
 * All HTML is inlined for max email client compat (no external CSS).
 */

import type { Locale } from "@/i18n/config"

export type EmailTemplate =
  | "welcome"
  | "day1_tip"
  | "day3_nudge"
  | "day7_tips"
  | "day14_upgrade"
  | "day21_testimonial"
  | "day30_winback"
  | "referral_converted"
  | "room_day1"
  | "protocol_streak"

export const SEQUENCE_TEMPLATES: ReadonlyArray<{ template: EmailTemplate; ageDays: number }> = [
  { template: "welcome", ageDays: 0 },
  { template: "day1_tip", ageDays: 1 },
  { template: "day3_nudge", ageDays: 3 },
  { template: "day7_tips", ageDays: 7 },
  { template: "day14_upgrade", ageDays: 14 },
  { template: "day21_testimonial", ageDays: 21 },
  { template: "day30_winback", ageDays: 30 },
] as const

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://prana.purama.dev"
const COMPANY_FOOTER_FR = `PURAMA · 8 Rue de la Chapelle, 25560 Frasne — France · <a href="${APP_URL}/settings/notifications" style="color:#7C3AED;">Préférences emails</a>`
const COMPANY_FOOTER_EN = `PURAMA · 8 Rue de la Chapelle, 25560 Frasne — France · <a href="${APP_URL}/settings/notifications" style="color:#7C3AED;">Email preferences</a>`

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

interface Ctx {
  firstName?: string | null
  appUrl?: string
  /** Optional template-specific extras. */
  extras?: Record<string, string | number>
}

function shell(opts: {
  locale: Locale
  preheader: string
  bodyHtml: string
}): string {
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

function name(ctx: Ctx, locale: Locale): string {
  if (ctx.firstName && ctx.firstName.trim()) return ctx.firstName.trim().split(/\s+/)[0]
  return locale === "en" ? "there" : "toi"
}

// ---------------- TEMPLATES ----------------

export function renderEmail(template: EmailTemplate, locale: Locale, ctx: Ctx): RenderedEmail {
  const url = ctx.appUrl ?? APP_URL
  const n = name(ctx, locale)

  switch (template) {
    case "welcome": {
      if (locale === "en") {
        const body = `<h1 style="font-family:Georgia,serif;font-size:24px;line-height:1.25;margin:0 0 16px;">Welcome, ${esc(n)}.</h1>
<p>Your space is ready. We start with one thing: <strong>regulate your nervous system</strong>.</p>
<p>20 seconds. Not 10 minutes. Not a course. Just one breath, guided.</p>
${btn("Try the first protocol", `${url}/regulate`)}
<p style="font-size:13px;color:#6B6B72;">7 days Pro free. No credit card. Cancel anytime.</p>`
        return {
          subject: `Welcome, ${n}. Let's breathe.`,
          html: shell({ locale, preheader: "Your PURAMA ONE space is ready.", bodyHtml: body }),
          text: `Welcome, ${n}.\n\nYour space is ready. Try the first protocol: ${url}/regulate\n\n7 days Pro free.`,
        }
      }
      const body = `<h1 style="font-family:Georgia,serif;font-size:24px;line-height:1.25;margin:0 0 16px;">Bienvenue, ${esc(n)}.</h1>
<p>Ton espace est prêt. On commence par une seule chose : <strong>réguler ton système nerveux</strong>.</p>
<p>20 secondes. Pas 10 minutes. Pas un cours. Juste une respiration guidée.</p>
${btn("Essayer le 1er protocole", `${url}/regulate`)}
<p style="font-size:13px;color:#6B6B72;">7 jours Pro offerts. Sans carte bancaire. Annule à tout moment.</p>`
      return {
        subject: `Bienvenue, ${n}. On respire.`,
        html: shell({ locale, preheader: "Ton espace PURAMA ONE est prêt.", bodyHtml: body }),
        text: `Bienvenue, ${n}.\n\nTon espace est prêt. Essaie le 1er protocole : ${url}/regulate\n\n7 jours Pro offerts.`,
      }
    }

    case "day1_tip": {
      if (locale === "en") {
        const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">A daily 20-second habit.</h1>
<p>Most users see results when they pulse-check <strong>once</strong> in the morning. That's it.</p>
<p>It's the smallest input the system needs to suggest the right action for you.</p>
${btn("Take today's pulse", `${url}/today`)}`
        return {
          subject: "20 seconds, every morning",
          html: shell({ locale, preheader: "The smallest habit that works.", bodyHtml: body }),
          text: `Pulse-check once a morning. ${url}/today`,
        }
      }
      const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Une habitude de 20 secondes.</h1>
<p>Ceux qui voient des résultats font un pulse-check <strong>une fois</strong> le matin. C'est tout.</p>
<p>C'est le minimum d'info dont le système a besoin pour te suggérer la bonne action.</p>
${btn("Faire mon pulse du jour", `${url}/today`)}`
      return {
        subject: "20 secondes, chaque matin",
        html: shell({ locale, preheader: "La plus petite habitude qui marche.", bodyHtml: body }),
        text: `Un pulse-check par matin. ${url}/today`,
      }
    }

    case "day3_nudge": {
      if (locale === "en") {
        const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Try voice capture.</h1>
<p>Talk to your phone for 10 seconds. PURAMA ONE turns it into tasks, projects, notes — sorted automatically.</p>
<p>It's the moment most people unlock the system.</p>
${btn("Open LifeOS", `${url}/lifeos`)}`
        return {
          subject: "Talk for 10 seconds. Watch.",
          html: shell({ locale, preheader: "Voice capture is the unlock moment.", bodyHtml: body }),
          text: `Try voice capture: ${url}/lifeos`,
        }
      }
      const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Essaie la capture vocale.</h1>
<p>Parle à ton téléphone 10 secondes. PURAMA ONE en fait des tâches, projets, notes — triés automatiquement.</p>
<p>C'est le moment où la plupart débloquent le système.</p>
${btn("Ouvrir LifeOS", `${url}/lifeos`)}`
      return {
        subject: "Parle 10 secondes. Regarde.",
        html: shell({ locale, preheader: "La capture vocale, c'est le déclic.", bodyHtml: body }),
        text: `Essaie la capture vocale : ${url}/lifeos`,
      }
    }

    case "day7_tips": {
      if (locale === "en") {
        const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">3 things power users do.</h1>
<ol style="padding-left:18px;">
<li><strong>One pulse a day.</strong> Same time, like coffee.</li>
<li><strong>Voice capture instead of notes.</strong> Faster, less friction.</li>
<li><strong>One Magic Button when stuck.</strong> Don't push through. Regulate first.</li>
</ol>
${btn("Open my space", `${url}/today`)}`
        return {
          subject: "Week 1 — 3 quick wins",
          html: shell({ locale, preheader: "3 habits from power users.", bodyHtml: body }),
          text: `3 habits: pulse-check, voice capture, regulate first.`,
        }
      }
      const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">3 trucs des utilisateurs avancés.</h1>
<ol style="padding-left:18px;">
<li><strong>Un pulse par jour.</strong> Même heure, comme le café.</li>
<li><strong>Capture vocale au lieu de notes.</strong> Plus vite, moins de friction.</li>
<li><strong>Un bouton magique quand tu bloques.</strong> Ne force pas. Régule d'abord.</li>
</ol>
${btn("Ouvrir mon espace", `${url}/today`)}`
      return {
        subject: "Semaine 1 — 3 wins rapides",
        html: shell({ locale, preheader: "3 habitudes des avancés.", bodyHtml: body }),
        text: `3 habitudes : pulse, capture vocale, réguler avant de pousser.`,
      }
    }

    case "day14_upgrade": {
      if (locale === "en") {
        const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">An honest offer.</h1>
<p>Your free trial ends soon. If you've felt the difference, here's <strong>20% off your first 3 months of Pro</strong>.</p>
<p style="background:#F4F1EA;padding:16px;border-radius:10px;font-family:monospace;font-size:14px;text-align:center;">UPGRADE20</p>
${btn("Use this discount", `${url}/pricing?promo=UPGRADE20`)}
<p style="font-size:13px;color:#6B6B72;">Cancel anytime. We don't dark-pattern.</p>`
        return {
          subject: "20% off — your call",
          html: shell({ locale, preheader: "An honest 20% off, no tricks.", bodyHtml: body }),
          text: `20% off code UPGRADE20 — ${url}/pricing?promo=UPGRADE20`,
        }
      }
      const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Une offre honnête.</h1>
<p>Ton essai gratuit se termine bientôt. Si tu as senti la différence, voici <strong>-20% sur tes 3 premiers mois Pro</strong>.</p>
<p style="background:#F4F1EA;padding:16px;border-radius:10px;font-family:monospace;font-size:14px;text-align:center;">UPGRADE20</p>
${btn("Utiliser cette réduction", `${url}/pricing?promo=UPGRADE20`)}
<p style="font-size:13px;color:#6B6B72;">Annule à tout moment. Pas de dark patterns.</p>`
      return {
        subject: "-20% — comme tu veux",
        html: shell({ locale, preheader: "Une réduction honnête, sans piège.", bodyHtml: body }),
        text: `-20% code UPGRADE20 — ${url}/pricing?promo=UPGRADE20`,
      }
    }

    case "day21_testimonial": {
      if (locale === "en") {
        const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Tell us what worked.</h1>
<p>You've been here three weeks. We'd love a single sentence: <strong>what's the moment PURAMA ONE actually helped?</strong></p>
<p>Reply directly to this email. We read everything.</p>
${btn("Or share a story", `${url}/feedback`)}`
        return {
          subject: "One sentence. That's all.",
          html: shell({ locale, preheader: "What worked for you?", bodyHtml: body }),
          text: `What worked? Reply to this email or ${url}/feedback`,
        }
      }
      const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Dis-nous ce qui a marché.</h1>
<p>Trois semaines déjà. Une seule phrase nous suffit : <strong>quel a été le moment où PURAMA ONE a vraiment aidé ?</strong></p>
<p>Réponds directement à cet email. On lit tout.</p>
${btn("Ou partage une histoire", `${url}/feedback`)}`
      return {
        subject: "Une phrase. C'est tout.",
        html: shell({ locale, preheader: "Qu'est-ce qui a marché pour toi ?", bodyHtml: body }),
        text: `Qu'est-ce qui a marché ? Réponds ou ${url}/feedback`,
      }
    }

    case "day30_winback": {
      if (locale === "en") {
        const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">We miss you.</h1>
<p>You haven't pulse-checked in a while. No guilt. Life happens.</p>
<p>If you want back in, your space is exactly where you left it.</p>
${btn("Open my space", `${url}/today`)}
<p style="font-size:13px;color:#6B6B72;">If this isn't for you anymore — <a href="${url}/settings/notifications" style="color:#7C3AED;">unsubscribe</a>. We'll respect that.</p>`
        return {
          subject: "Your space is still here",
          html: shell({ locale, preheader: "No guilt. Just an open door.", bodyHtml: body }),
          text: `Your space is here when you want: ${url}/today`,
        }
      }
      const body = `<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">On a perdu ton signal.</h1>
<p>Tu n'as pas fait de pulse depuis un moment. Aucun reproche. La vie, c'est comme ça.</p>
<p>Si tu veux revenir, ton espace est exactement là où tu l'as laissé.</p>
${btn("Ouvrir mon espace", `${url}/today`)}
<p style="font-size:13px;color:#6B6B72;">Si ce n'est plus pour toi — <a href="${url}/settings/notifications" style="color:#7C3AED;">désabonne-toi</a>. On respecte.</p>`
      return {
        subject: "Ton espace t'attend",
        html: shell({ locale, preheader: "Sans reproche. Juste une porte ouverte.", bodyHtml: body }),
        text: `Ton espace est là quand tu veux : ${url}/today`,
      }
    }

    case "referral_converted": {
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

    case "room_day1": {
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

    case "protocol_streak": {
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
  }
}
