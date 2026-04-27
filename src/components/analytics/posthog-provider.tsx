"use client"

import { useEffect } from "react"

export function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com"
    if (!key) return
    if (process.env.NODE_ENV !== "production") return
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
    })
    return () => {
      cancelled = true
    }
  }, [])
  return null
}
