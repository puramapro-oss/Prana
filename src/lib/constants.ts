/**
 * PRANA — Constantes de domaine.
 * Source unique de vérité.
 */

export const APP_NAME = "PRANA"
export const APP_BRAND = "PURAMA ONE"
export const APP_SLUG = "prana"
export const APP_DOMAIN = "prana.purama.dev"
export const APP_URL = `https://${APP_DOMAIN}`
export const APP_TAGLINE = "L'OS humain qui te calme, t'organise, et exécute pour toi."

export const COMPANY_INFO = {
  legalName: "SASU PURAMA",
  address: "8 Rue de la Chapelle, 25560 Frasne, France",
  vat: "TVA non applicable, art. 293 B du CGI",
  rcs: "Besançon",
  zfrr: true,
  contact: "matiss.frasne@gmail.com",
} as const

export const ASSO_INFO = {
  legalName: "Association PURAMA",
  president: "Solenne DORNIER",
} as const

export const WALLET_MIN_WITHDRAWAL_EUR = 5

export const TIMEZONE_DEFAULT = "Europe/Paris"

export const LOCALES = ["fr", "en"] as const
export const DEFAULT_LOCALE = "fr"

/**
 * Plan-based daily quotas. Enforced server-side in API routes.
 */
export const DAILY_QUOTAS = {
  free: {
    magicButtons: 3,
    protocols: 1,
    captures: 1,
    executions: 0,
  },
  starter: {
    magicButtons: Infinity,
    protocols: Infinity,
    captures: Infinity,
    executions: 5,
  },
  pro: {
    magicButtons: Infinity,
    protocols: Infinity,
    captures: Infinity,
    executions: Infinity,
  },
  ultime: {
    magicButtons: Infinity,
    protocols: Infinity,
    captures: Infinity,
    executions: Infinity,
  },
} as const
