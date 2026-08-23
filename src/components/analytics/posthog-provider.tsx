"use client"

import { useEffect, useRef } from "react"
import { useCookieConsent } from "@/lib/legal/hooks/useCookieConsent"

/**
 * Ne charge/initialise posthog-js QUE si l'utilisateur a explicitement consenti au cookie de
 * mesure d'audience (`consent.mesure === true`, cf bandeau `CookieConsentBanner`). Avant ce
 * consentement, ou si l'utilisateur refuse/n'a pas encore choisi, aucun script posthog n'est
 * chargé et aucun cookie n'est déposé (conforme au texte de `confidentialite/page.tsx` §9 :
 * "cookies de mesure d'audience... déposés uniquement après ton consentement explicite").
 * Si l'utilisateur retire son consentement après coup (bandeau "Personnaliser"), on appelle
 * `opt_out_capturing()` plutôt que de laisser tourner un tracker déjà chargé.
 */
export function PostHogProvider() {
  const { consent, hydrated } = useCookieConsent()
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!hydrated) return
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com"
    if (!key) return
    if (process.env.NODE_ENV !== "production") return

    if (!consent?.mesure) {
      const win = window as unknown as { posthog?: { opt_out_capturing: () => void } }
      if (loadedRef.current) win.posthog?.opt_out_capturing()
      return
    }

    if (loadedRef.current) {
      const win = window as unknown as { posthog?: { opt_in_capturing: () => void } }
      win.posthog?.opt_in_capturing()
      return
    }

    let cancelled = false
    void import("posthog-js").then((mod) => {
      if (cancelled) return
      const posthog = mod.default
      type PosthogConfig = {
        api_host: string
        capture_pageview: boolean
        capture_pageleave: boolean
        person_profiles: "identified_only" | "always"
        autocapture: boolean
        disable_session_recording: boolean
      }
      const config: PosthogConfig = {
        api_host: host,
        capture_pageview: true,
        capture_pageleave: true,
        person_profiles: "identified_only",
        autocapture: false,
        disable_session_recording: true,
      }
      ;(posthog as unknown as { init: (key: string, cfg: PosthogConfig) => void }).init(key, config)
      ;(window as unknown as { posthog?: typeof posthog }).posthog = posthog
      loadedRef.current = true
    })
    return () => {
      cancelled = true
    }
  }, [hydrated, consent?.mesure])
  return null
}
