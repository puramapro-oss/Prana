import type { Json, ReferralStatus } from "../scalars"

export interface UserPointsTable {
  Row: {
    user_id: string
    points: number
    cash_eur_centimes: number
    total_earned: number
    total_redeemed: number
    updated_at: string
  }
  Insert: {
    user_id: string
    points?: number
    cash_eur_centimes?: number
    total_earned?: number
    total_redeemed?: number
    updated_at?: string
  }
  Update: {
    points?: number
    cash_eur_centimes?: number
    total_earned?: number
    total_redeemed?: number
    updated_at?: string
  }
  Relationships: []
}

export interface PointEventsTable {
  Row: {
    id: string
    user_id: string
    delta: number
    reason: string
    metadata: Json | null
    created_at: string
  }
  Insert: {
    id?: string
    user_id: string
    delta: number
    reason: string
    metadata?: Json | null
    created_at?: string
  }
  Update: {
    delta?: number
    reason?: string
    metadata?: Json | null
  }
  Relationships: []
}

export interface ReferralsTable {
  Row: {
    id: string
    referrer_id: string
    referee_id: string
    status: ReferralStatus
    reward_points: number | null
    created_at: string
  }
  Insert: {
    id?: string
    referrer_id: string
    referee_id: string
    status?: ReferralStatus
    reward_points?: number | null
    created_at?: string
  }
  Update: {
    status?: ReferralStatus
    reward_points?: number | null
  }
  Relationships: []
}
