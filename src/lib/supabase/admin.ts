import { createClient } from "@supabase/supabase-js"

/**
 * Admin client — bypasses RLS. Server-only. Untyped on purpose: it crosses
 * many tables (including ones not yet in our hand-written `Database` type).
 *
 * Use ONLY in:
 * - Webhook handlers (Stripe, Resend) where user auth not yet established
 * - Cron jobs (admin context)
 * - Migrations / seed scripts
 *
 * NEVER import this from a client component or expose service role key.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Admin client cannot be used in the browser")
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: "prana" },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
