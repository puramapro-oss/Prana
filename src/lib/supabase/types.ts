/**
 * Supabase generated types — minimal manual types for now.
 * Will be regenerated via `supabase gen types typescript` in P8.
 *
 * Shape mirrors `supabase gen types typescript` output to satisfy
 * postgrest-js v12 GenericSchema constraint. CRITICAL: `Row` types must be
 * inline anonymous object literals (NOT named interfaces) to satisfy
 * `Record<string, unknown>` index signature compatibility.
 */

export type Plan = "free" | "starter" | "pro" | "ultime"
export type Locale = "fr" | "en"
export type TaskStatus = "todo" | "doing" | "done" | "dropped"
export type CaptureSource = "text" | "voice" | "image" | "email" | "share"
export type ExecutionType = "message" | "email" | "post" | "plan" | "doc" | "script"
export type SafetySeverity = "low" | "medium" | "high" | "critical"
export type ReferralStatus = "pending" | "converted" | "rewarded"
export type TimeAvailable = "20s" | "2min" | "10min" | "1h"
export type PulseContext = "home" | "work" | "outside" | "transit" | "bed" | "other"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12"
  }
  prana: {
    Tables: {
      profiles: {
        Row: {
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
        Insert: {
          id: string
          email: string
          display_name?: string | null
          locale?: Locale
          timezone?: string
          plan?: Plan
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          onboarded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          locale?: Locale
          timezone?: string
          plan?: Plan
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          onboarded_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pulse_checks: {
        Row: {
          id: string
          user_id: string
          stress: number
          energy: number
          time_available: TimeAvailable
          context: PulseContext
          mood_tags: string[]
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stress: number
          energy: number
          time_available: TimeAvailable
          context: PulseContext
          mood_tags?: string[]
          notes?: string | null
          created_at?: string
        }
        Update: {
          stress?: number
          energy?: number
          mood_tags?: string[]
          notes?: string | null
        }
        Relationships: []
      }
      regulation_protocols: {
        Row: {
          id: string
          slug: string
          name_fr: string
          name_en: string
          duration_seconds: number
          category: string
          steps: Json
          audio_url_fr: string | null
          audio_url_en: string | null
          base_plan: Plan
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_fr: string
          name_en: string
          duration_seconds: number
          category: string
          steps: Json
          audio_url_fr?: string | null
          audio_url_en?: string | null
          base_plan?: Plan
          created_at?: string
        }
        Update: {
          name_fr?: string
          name_en?: string
          duration_seconds?: number
          category?: string
          steps?: Json
          audio_url_fr?: string | null
          audio_url_en?: string | null
          base_plan?: Plan
        }
        Relationships: []
      }
      regulation_sessions: {
        Row: {
          id: string
          user_id: string
          protocol_id: string
          pulse_before_id: string | null
          pulse_after_id: string | null
          completed: boolean
          duration_seconds_actual: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          protocol_id: string
          pulse_before_id?: string | null
          pulse_after_id?: string | null
          completed?: boolean
          duration_seconds_actual?: number | null
          created_at?: string
        }
        Update: {
          pulse_after_id?: string | null
          completed?: boolean
          duration_seconds_actual?: number | null
        }
        Relationships: []
      }
      magic_button_usages: {
        Row: {
          id: string
          user_id: string
          button_slug: string
          prompt_input: Json | null
          output: Json | null
          fallback_used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          button_slug: string
          prompt_input?: Json | null
          output?: Json | null
          fallback_used?: boolean
          created_at?: string
        }
        Update: {
          output?: Json | null
          fallback_used?: boolean
        }
        Relationships: []
      }
    }
    Views: { [k: string]: never }
    Functions: { [k: string]: never }
    Enums: { [k: string]: never }
    CompositeTypes: { [k: string]: never }
  }
  public: {
    Tables: { [k: string]: never }
    Views: { [k: string]: never }
    Functions: { [k: string]: never }
    Enums: { [k: string]: never }
    CompositeTypes: { [k: string]: never }
  }
}

/** Convenience aliases — derived from inline Database to keep one source of truth. */
export type PranaTables = Database["prana"]["Tables"]

export type Profile = PranaTables["profiles"]["Row"]
export type ProfileInsert = PranaTables["profiles"]["Insert"]
export type ProfileUpdate = PranaTables["profiles"]["Update"]

export type PulseCheck = PranaTables["pulse_checks"]["Row"]
export type PulseCheckInsert = PranaTables["pulse_checks"]["Insert"]

export type RegulationProtocol = PranaTables["regulation_protocols"]["Row"]
export type RegulationSession = PranaTables["regulation_sessions"]["Row"]
export type RegulationSessionInsert = PranaTables["regulation_sessions"]["Insert"]

export type MagicButtonUsage = PranaTables["magic_button_usages"]["Row"]
export type MagicButtonUsageInsert = PranaTables["magic_button_usages"]["Insert"]
