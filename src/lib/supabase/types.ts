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
export type ProjectStatus = "active" | "paused" | "done" | "dropped"
export type EnergyRequired = "low" | "medium" | "high"
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
      captures: {
        Row: {
          id: string
          user_id: string
          raw_text: string
          source: CaptureSource
          audio_url: string | null
          classified_at: string | null
          classification: Json | null
          archived: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          raw_text: string
          source: CaptureSource
          audio_url?: string | null
          classified_at?: string | null
          classification?: Json | null
          archived?: boolean
          created_at?: string
        }
        Update: {
          raw_text?: string
          classified_at?: string | null
          classification?: Json | null
          archived?: boolean
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          why: string | null
          status: ProjectStatus
          target_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          why?: string | null
          status?: ProjectStatus
          target_date?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          why?: string | null
          status?: ProjectStatus
          target_date?: string | null
        }
        Relationships: []
      }
      people: {
        Row: {
          id: string
          user_id: string
          name: string
          relation: string | null
          notes: string | null
          last_contact_at: string | null
          contact_frequency_days: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          relation?: string | null
          notes?: string | null
          last_contact_at?: string | null
          contact_frequency_days?: number | null
          created_at?: string
        }
        Update: {
          name?: string
          relation?: string | null
          notes?: string | null
          last_contact_at?: string | null
          contact_frequency_days?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: TaskStatus
          priority: number
          energy_required: EnergyRequired | null
          time_estimate_minutes: number | null
          due_at: string | null
          project_id: string | null
          person_id: string | null
          source_capture_id: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: TaskStatus
          priority?: number
          energy_required?: EnergyRequired | null
          time_estimate_minutes?: number | null
          due_at?: string | null
          project_id?: string | null
          person_id?: string | null
          source_capture_id?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          status?: TaskStatus
          priority?: number
          energy_required?: EnergyRequired | null
          time_estimate_minutes?: number | null
          due_at?: string | null
          project_id?: string | null
          person_id?: string | null
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string | null
          body: string
          tags: string[]
          pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          body: string
          tags?: string[]
          pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string | null
          body?: string
          tags?: string[]
          pinned?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      lifeos_plans: {
        Row: {
          id: string
          user_id: string
          start_date: string
          payload: Json
          generated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          payload: Json
          generated_at?: string
        }
        Update: {
          payload?: Json
          generated_at?: string
        }
        Relationships: []
      }
      twin_profiles: {
        Row: {
          id: string
          user_id: string
          communication_style: Json | null
          decision_patterns: Json | null
          stress_triggers: string[] | null
          recharge_activities: string[] | null
          efficient_hours: number[] | null
          working_habits: Json | null
          personal_rules: string[] | null
          values: string[] | null
          protective_mode: boolean
          last_full_update: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          communication_style?: Json | null
          decision_patterns?: Json | null
          stress_triggers?: string[] | null
          recharge_activities?: string[] | null
          efficient_hours?: number[] | null
          working_habits?: Json | null
          personal_rules?: string[] | null
          values?: string[] | null
          protective_mode?: boolean
          last_full_update?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          communication_style?: Json | null
          decision_patterns?: Json | null
          stress_triggers?: string[] | null
          recharge_activities?: string[] | null
          efficient_hours?: number[] | null
          working_habits?: Json | null
          personal_rules?: string[] | null
          values?: string[] | null
          protective_mode?: boolean
          last_full_update?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      executions: {
        Row: {
          id: string
          user_id: string
          type: ExecutionType
          context_json: Json | null
          draft_text: string
          draft_alternatives: Json | null
          approved: boolean
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: ExecutionType
          context_json?: Json | null
          draft_text: string
          draft_alternatives?: Json | null
          approved?: boolean
          used_at?: string | null
          created_at?: string
        }
        Update: {
          context_json?: Json | null
          draft_text?: string
          draft_alternatives?: Json | null
          approved?: boolean
          used_at?: string | null
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

export type Capture = PranaTables["captures"]["Row"]
export type CaptureInsert = PranaTables["captures"]["Insert"]
export type CaptureUpdate = PranaTables["captures"]["Update"]

export type Project = PranaTables["projects"]["Row"]
export type ProjectInsert = PranaTables["projects"]["Insert"]
export type ProjectUpdate = PranaTables["projects"]["Update"]

export type Person = PranaTables["people"]["Row"]
export type PersonInsert = PranaTables["people"]["Insert"]
export type PersonUpdate = PranaTables["people"]["Update"]

export type Task = PranaTables["tasks"]["Row"]
export type TaskInsert = PranaTables["tasks"]["Insert"]
export type TaskUpdate = PranaTables["tasks"]["Update"]

export type Note = PranaTables["notes"]["Row"]
export type NoteInsert = PranaTables["notes"]["Insert"]
export type NoteUpdate = PranaTables["notes"]["Update"]

export type LifeosPlan = PranaTables["lifeos_plans"]["Row"]
export type LifeosPlanInsert = PranaTables["lifeos_plans"]["Insert"]
export type LifeosPlanUpdate = PranaTables["lifeos_plans"]["Update"]

export type Execution = PranaTables["executions"]["Row"]
export type ExecutionInsert = PranaTables["executions"]["Insert"]
export type ExecutionUpdate = PranaTables["executions"]["Update"]

export type TwinProfile = PranaTables["twin_profiles"]["Row"]
export type TwinProfileInsert = PranaTables["twin_profiles"]["Insert"]
export type TwinProfileUpdate = PranaTables["twin_profiles"]["Update"]

/**
 * Strongly-typed shape of `twin_profiles.communication_style` JSONB.
 * Aligns with sliders exposed in /twin/personality.
 */
export interface TwinCommunicationStyle {
  tone?: "casual" | "warm" | "professional" | "direct" | "playful" | null
  length?: "short" | "medium" | "long" | null
  formality?: "low" | "medium" | "high" | null
  emoji_use?: "none" | "rare" | "moderate" | "frequent" | null
}

/**
 * Strongly-typed shape of `twin_profiles.working_habits` JSONB.
 */
export interface TwinWorkingHabits {
  best_focus_window?: "morning" | "afternoon" | "evening" | "night" | null
  break_frequency_minutes?: number | null
  preferred_session_minutes?: number | null
  avoid_meetings_before_hour?: number | null
  weekends_off?: boolean | null
}

/**
 * Strongly-typed shape of `twin_profiles.decision_patterns` JSONB.
 */
export interface TwinDecisionPatterns {
  speed?: "fast" | "deliberate" | "context_dependent" | null
  evidence_preference?: "data" | "intuition" | "balanced" | null
  risk_appetite?: "low" | "medium" | "high" | null
  consultation?: "solo" | "with_others" | "varies" | null
}

/**
 * Classification output from the LifeOS classifier (haiku-4-5).
 * Stored as JSONB in `captures.classification`.
 */
export interface CaptureClassification {
  type: "task" | "note" | "project" | "person_note" | "idea" | "ignore"
  priority: 1 | 2 | 3 | 4 | 5
  suggested_title: string
  energy_required: EnergyRequired | null
  time_estimate_minutes: number | null
  project_match: string | null
  person_match: string | null
  tags: string[]
  reasoning: string
}
