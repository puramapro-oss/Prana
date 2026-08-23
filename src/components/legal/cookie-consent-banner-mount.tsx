"use client"

import CookieConsentBanner from "@/lib/legal/components/CookieConsentBanner"
import type { CookieConsent } from "@/lib/legal/hooks/useCookieConsent"
import { APP_BRAND } from "@/lib/constants"

export function CookieConsentBannerMount() {
  return (
    <CookieConsentBanner
      appName={APP_BRAND}
      politiqueHref="/confidentialite"
      onConsent={(consent: CookieConsent) => {
        fetch("/api/legal/cookie-consent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mesure: consent.mesure, marketing: consent.marketing }),
        }).catch(() => {})
      }}
    />
  )
}
