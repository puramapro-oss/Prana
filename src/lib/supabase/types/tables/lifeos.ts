import type { Json, ExecutionType } from "../scalars"

export interface LifeosPlansTable {
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

export interface TwinProfilesTable {
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

export interface ExecutionsTable {
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

export interface DailyScoresTable {
  Row: {
    id: string
    user_id: string
    date: string
    stress_avg: number | null
    energy_avg: number | null
    sleep_quality: number | null
    focus_minutes: number
    one_action_done: boolean
    micro_actions_done: number
    protocols_done: number
    streak_days: number
    created_at: string
  }
  Insert: {
    id?: string
    user_id: string
    date: string
    stress_avg?: number | null
    energy_avg?: number | null
    sleep_quality?: number | null
    focus_minutes?: number
    one_action_done?: boolean
    micro_actions_done?: number
    protocols_done?: number
    streak_days?: number
    created_at?: string
  }
  Update: {
    stress_avg?: number | null
    energy_avg?: number | null
    sleep_quality?: number | null
    focus_minutes?: number
    one_action_done?: boolean
    micro_actions_done?: number
    protocols_done?: number
    streak_days?: number
  }
  Relationships: []
}

/** Strongly-typed shape of `twin_profiles.communication_style` JSONB */
export interface TwinCommunicationStyle {
  tone?: "casual" | "warm" | "professional" | "direct" | "playful" | null
  length?: "short" | "medium" | "long" | null
  formality?: "low" | "medium" | "high" | null
  emoji_use?: "none" | "rare" | "moderate" | "frequent" | null
}

/** Strongly-typed shape of `twin_profiles.working_habits` JSONB */
export interface TwinWorkingHabits {
  best_focus_window?: "morning" | "afternoon" | "evening" | "night" | null
  break_frequency_minutes?: number | null
  preferred_session_minutes?: number | null
  avoid_meetings_before_hour?: number | null
  weekends_off?: boolean | null
}

/** Strongly-typed shape of `twin_profiles.decision_patterns` JSONB */
export interface TwinDecisionPatterns {
  speed?: "fast" | "deliberate" | "context_dependent" | null
  evidence_preference?: "data" | "intuition" | "balanced" | null
  risk_appetite?: "low" | "medium" | "high" | null
  consultation?: "solo" | "with_others" | "varies" | null
}
