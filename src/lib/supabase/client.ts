import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

export const PRANA_SCHEMA = "prana" as const

export function createClient() {
  return createBrowserClient<Database, "prana">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: PRANA_SCHEMA } },
  )
}
