import type { MetadataRoute } from "next"
import { createAdminClient } from "@/lib/supabase/admin"

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://prana.purama.dev"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/manifesto`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/safety`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/cgu`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ]

  let roomEntries: MetadataRoute.Sitemap = []
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from("rooms")
      .select("slug, updated_at, is_official")
      .eq("is_official", true)
      .limit(50)
    if (data) {
      type RoomRow = { slug: string; updated_at: string | null }
      roomEntries = (data as RoomRow[]).map((r) => ({
        url: `${BASE}/rooms/${r.slug}`,
        lastModified: r.updated_at ? new Date(r.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
    }
  } catch {
    // Sitemap doit toujours répondre — fail-soft sur DB.
  }

  return [...staticPages, ...roomEntries]
}
