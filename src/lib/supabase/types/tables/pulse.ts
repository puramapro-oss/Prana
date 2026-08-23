import type { Json, TimeAvailable, PulseContext, Plan } from "../scalars"

export interface PulseChecksTable {
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

export interface RegulationProtocolsTable {
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

export interface RegulationSessionsTable {
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
