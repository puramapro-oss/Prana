import type { MetadataRoute } from "next"

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://prana.purama.dev"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/today/",
          "/regulate/",
          "/lifeos/",
          "/execute/",
          "/rooms/",
          "/twin/",
          "/score/",
          "/settings/",
          "/sos",
          "/ref/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
