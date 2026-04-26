/**
 * SAFETY NET — hotlines hardcoded.
 * NEVER fetch dynamically. NEVER replace with API call.
 * If a number changes, edit this file and deploy.
 */

export interface Hotline {
  country: string
  countryCode: string
  name: string
  number?: string
  url?: string
  description: string
  hours: string
  free: boolean
}

export const HOTLINES: Hotline[] = [
  {
    country: "France",
    countryCode: "FR",
    name: "3114",
    number: "3114",
    description: "Numéro national de prévention du suicide. Anonyme, gratuit, par des professionnels.",
    hours: "24h/24, 7j/7",
    free: true,
  },
  {
    country: "United States",
    countryCode: "US",
    name: "988",
    number: "988",
    description: "Suicide & Crisis Lifeline. Free and confidential.",
    hours: "24/7",
    free: true,
  },
  {
    country: "International",
    countryCode: "INTL",
    name: "Find a Helpline",
    url: "https://findahelpline.com",
    description: "Trouve une ligne d'écoute dans ton pays.",
    hours: "—",
    free: true,
  },
]

export function getHotlineForLocale(locale: string): Hotline {
  const lc = locale.toLowerCase()
  if (lc.startsWith("fr")) return HOTLINES[0]
  if (lc.startsWith("en") || lc.includes("us")) return HOTLINES[1]
  return HOTLINES[2]
}
