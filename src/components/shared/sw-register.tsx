"use client"

import { useEffect } from "react"

const SW_PATH = "/sw.js"

export function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return
    if (process.env.NODE_ENV !== "production") return

    let cancelled = false

    const onLoad = async () => {
      try {
        const registration = await navigator.serviceWorker.register(SW_PATH, { scope: "/" })
        if (cancelled) return

        // Auto-update detection: if a new SW is waiting, ask it to take over
        if (registration.waiting) {
          registration.waiting.postMessage("SKIP_WAITING")
        }
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              newWorker.postMessage("SKIP_WAITING")
            }
          })
        })
      } catch {
        // SW registration failed: app still works, just no offline fallback
      }
    }

    if (document.readyState === "complete") {
      onLoad()
    } else {
      window.addEventListener("load", onLoad)
    }

    let reloaded = false
    const onControllerChange = () => {
      if (reloaded) return
      reloaded = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)

    return () => {
      cancelled = true
      window.removeEventListener("load", onLoad)
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
    }
  }, [])

  return null
}
