"use client"

import { useEffect } from "react"

export function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) return
    if (process.env.NODE_ENV !== "production") return
    let cancelled = false
    void import("@sentry/nextjs").then((Sentry) => {
      if (cancelled) return
      Sentry.init({
        dsn,
        environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "production",
        tracesSampleRate: 0.05,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0,
        ignoreErrors: [
          "AbortError",
          "ResizeObserver loop limit exceeded",
          "Non-Error promise rejection captured",
        ],
      })
    })
    return () => {
      cancelled = true
    }
  }, [])
  return null
}
