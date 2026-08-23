import type { Json, EnergyRequired } from "../scalars"

export interface RoomsTable {
  Row: {
    id: string
    slug: string
    name_fr: string
    name_en: string
    description_fr: string | null
    description_en: string | null
    duration_days: number
    category: string
    daily_action_template: Json | null
    created_by: string | null
    is_official: boolean
    is_premium: boolean
    cover_image_url: string | null
    participants_count: number
    created_at: string
  }
  Insert: {
    id?: string
    slug: string
    name_fr: string
    name_en: string
    description_fr?: string | null
    description_en?: string | null
    duration_days: number
    category: string
    daily_action_template?: Json | null
    created_by?: string | null
    is_official?: boolean
    is_premium?: boolean
    cover_image_url?: string | null
    participants_count?: number
    created_at?: string
  }
  Update: {
    name_fr?: string
    name_en?: string
    description_fr?: string | null
    description_en?: string | null
    duration_days?: number
    category?: string
    daily_action_template?: Json | null
    is_official?: boolean
    is_premium?: boolean
    cover_image_url?: string | null
    participants_count?: number
  }
  Relationships: []
}

export interface RoomMembershipsTable {
  Row: {
    id: string
    room_id: string
    user_id: string
    joined_at: string
    current_day: number
    completed: boolean
    invited_by: string | null
  }
  Insert: {
    id?: string
    room_id: string
    user_id: string
    joined_at?: string
    current_day?: number
    completed?: boolean
    invited_by?: string | null
  }
  Update: {
    current_day?: number
    completed?: boolean
  }
  Relationships: []
}

export interface RoomMessagesTable {
  Row: {
    id: string
    room_id: string
    user_id: string | null
    is_ai_host: boolean
    body: string
    day_number: number | null
    created_at: string
  }
  Insert: {
    id?: string
    room_id: string
    user_id?: string | null
    is_ai_host?: boolean
    body: string
    day_number?: number | null
    created_at?: string
  }
  Update: {
    body?: string
  }
  Relationships: []
}

/** Strongly-typed shape of one entry inside `rooms.daily_action_template` JSONB */
export interface RoomDayAction {
  day: number
  title: string
  action: string
  why: string
  energy: EnergyRequired
}
