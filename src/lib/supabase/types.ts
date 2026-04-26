/**
 * Supabase generated types — minimal manual types for now.
 * Will be regenerated via `supabase gen types typescript` in P8.
 */

export type Plan = "free" | "starter" | "pro" | "ultime"
export type Locale = "fr" | "en"
export type TaskStatus = "todo" | "doing" | "done" | "dropped"
export type CaptureSource = "text" | "voice" | "image" | "email" | "share"
export type ExecutionType = "message" | "email" | "post" | "plan" | "doc" | "script"
export type SafetySeverity = "low" | "medium" | "high" | "critical"
export type ReferralStatus = "pending" | "converted" | "rewarded"

export interface Profile {
  id: string
  email: string
  display_name: string | null
  locale: Locale
  timezone: string
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  trial_ends_at: string | null
  onboarded_at: string | null
  created_at: string
  updated_at: string
}

export interface PulseCheck {
  id: string
  user_id: string
  stress: number
  energy: number
  time_available: "20s" | "2min" | "10min" | "1h"
  context: "home" | "work" | "outside" | "transit" | "bed" | "other"
  mood_tags: string[]
  notes: string | null
  created_at: string
}

type TableShape<TRow> = {
  Row: TRow
  Insert: Partial<TRow>
  Update: Partial<TRow>
  Relationships: []
}

type PranaTables = {
  profiles: TableShape<Profile>
  pulse_checks: TableShape<PulseCheck>
}

/**
 * Supabase typed schema. The `prana` schema is the primary one for this app
 * (cf. `db: { schema: "prana" }` on every client). `public` exists as a stub
 * to satisfy `@supabase/ssr` defaults — we never query it.
 *
 * Tables not yet typed are intentionally omitted; queries on them go through
 * the untyped admin client (`createAdminClient`) until P8 codegen.
 */
export interface Database {
  prana: {
    Tables: PranaTables
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
  public: {
    Tables: PranaTables
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
