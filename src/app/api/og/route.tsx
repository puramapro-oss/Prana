import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = (searchParams.get("title") ?? "PURAMA ONE").slice(0, 90)
  const subtitle = (
    searchParams.get("subtitle") ?? "L'OS humain — calme, organise, exécute"
  ).slice(0, 140)

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0F172A 0%, #1E293B 35%, #0F766E 100%)",
          padding: "72px",
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#FBFAF7",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background:
                "linear-gradient(135deg, #5EEAD4 0%, #14B8A6 60%, #0F766E 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
              color: "#0F172A",
            }}
          >
            P
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, opacity: 0.85, letterSpacing: 1.5 }}>
            PURAMA ONE
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 1000,
              letterSpacing: -1,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 30,
              fontWeight: 400,
              opacity: 0.78,
              maxWidth: 980,
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: 0.7,
            fontSize: 22,
          }}
        >
          <div>prana.purama.dev</div>
          <div style={{ display: "flex", gap: 28 }}>
            <span>Régule</span>
            <span>·</span>
            <span>Organise</span>
            <span>·</span>
            <span>Exécute</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
