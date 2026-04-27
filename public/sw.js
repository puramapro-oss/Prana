// PRANA Service Worker — Network-First with offline fallback
// Bumped on each release via the SW_VERSION constant below
const SW_VERSION = "v1.1.0"
const CACHE_PREFIX = "prana"
const STATIC_CACHE = `${CACHE_PREFIX}-static-${SW_VERSION}`
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${SW_VERSION}`

const STATIC_ASSETS = [
  "/offline",
  "/manifest.webmanifest",
]

// Install: precache offline shell (best-effort, never fail install)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      try {
        await cache.addAll(STATIC_ASSETS)
      } catch (_) {
        // assets not yet built — install still completes
      }
    })
  )
  self.skipWaiting()
})

// Activate: drop old caches, take control
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

function isHtmlNavigation(request) {
  return request.mode === "navigate" || (request.method === "GET" && request.headers.get("accept")?.includes("text/html"))
}

function isCacheableAsset(url) {
  // Only cache GET, same-origin, /_next/static and /icons and /fonts
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.startsWith("/fonts/") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".webmanifest"))
  )
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)

  // Never intercept API, auth, OAuth, Stripe, analytics, Sentry, supabase
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/sos") ||
    url.hostname.includes("auth.purama.dev") ||
    url.hostname.includes("stripe.com") ||
    url.hostname.includes("posthog") ||
    url.hostname.includes("sentry") ||
    url.hostname.includes("vercel-insights")
  ) {
    return
  }

  // HTML navigations: network-first → fallback offline
  if (isHtmlNavigation(request)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request)
          // best-effort cache the navigation page
          if (fresh.ok && fresh.type === "basic") {
            const cache = await caches.open(RUNTIME_CACHE)
            cache.put(request, fresh.clone()).catch(() => {})
          }
          return fresh
        } catch (_) {
          const cached = await caches.match(request)
          if (cached) return cached
          const offline = await caches.match("/offline")
          if (offline) return offline
          return new Response("<h1>Hors ligne</h1>", { headers: { "Content-Type": "text/html; charset=utf-8" } })
        }
      })()
    )
    return
  }

  // Static assets: cache-first
  if (isCacheableAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone)).catch(() => {})
          }
          return response
        })
      })
    )
  }
})

// Allow page-side request to skip waiting (after a deploy)
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting()
})
