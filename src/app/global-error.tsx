"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      void import("@sentry/nextjs").then((Sentry) => {
        Sentry.captureException(error)
      })
    }
  }, [error])

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0F172A",
          color: "#FBFAF7",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <main>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Quelque chose s&apos;est cassé.
          </h1>
          <p style={{ opacity: 0.75, maxWidth: "32rem", margin: "0 auto 1.5rem" }}>
            On est désolés. L&apos;équipe est notifiée. Tu peux réessayer ou revenir plus tard.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#5EEAD4",
              color: "#0F172A",
              border: 0,
              borderRadius: "0.5rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
          {error.digest ? (
            <p style={{ marginTop: "2rem", fontSize: "0.75rem", opacity: 0.5 }}>
              Réf: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  )
}
