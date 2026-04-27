import { cookies, headers } from "next/headers"
import { getRequestConfig } from "next-intl/server"
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config"

function negotiateFromAcceptLanguage(value: string | null): Locale | null {
  if (!value) return null
  const first = value.split(",")[0]?.trim().toLowerCase()
  if (!first) return null
  if (first.startsWith("en")) return "en"
  if (first.startsWith("fr")) return "fr"
  return null
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(LOCALE_COOKIE)?.value
  let locale: Locale = DEFAULT_LOCALE
  if (isLocale(cookieValue)) {
    locale = cookieValue
  } else {
    const headerStore = await headers()
    const negotiated = negotiateFromAcceptLanguage(headerStore.get("accept-language"))
    if (negotiated) locale = negotiated
  }

  const messages = (await import(`../../messages/${locale}.json`)).default
  return { locale, messages }
})
