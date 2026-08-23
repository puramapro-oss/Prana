import type { Json, Locale, Plan } from "../scalars"

export interface ProfilesTable {
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
    metadata: Json
    referral_code: string | null
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
    metadata?: Json
    referral_code?: string | null
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
    metadata?: Json
    referral_code?: string | null
    updated_at?: string
  }
  Relationships: []
}

export interface LegalAcceptancesTable {
  Row: {
    id: string
    user_id: string
    doc_type: "mentions" | "cgu" | "cgv" | "confidentialite"
    version: string
    accepted_at: string
    ip: string | null
    user_agent: string | null
  }
  Insert: {
    id?: string
    user_id: string
    doc_type: "mentions" | "cgu" | "cgv" | "confidentialite"
    version: string
    accepted_at?: string
    ip?: string | null
    user_agent?: string | null
  }
  Update: {
    version?: string
    accepted_at?: string
  }
  Relationships: []
}

export interface CookieConsentsTable {
  Row: {
    user_id: string
    necessaire: boolean
    mesure: boolean
    marketing: boolean
    updated_at: string
  }
  Insert: {
    user_id: string
    necessaire?: boolean
    mesure?: boolean
    marketing?: boolean
    updated_at?: string
  }
  Update: {
    necessaire?: boolean
    mesure?: boolean
    marketing?: boolean
    updated_at?: string
  }
  Relationships: []
}

export interface AccountDeletionRequestsTable {
  Row: {
    id: string
    user_id: string
    requested_at: string
    scheduled_for: string
    reason: string | null
    status: "scheduled" | "executing" | "completed" | "cancelled"
    cancelled_at: string | null
    completed_at: string | null
  }
  Insert: {
    id?: string
    user_id: string
    requested_at?: string
    scheduled_for: string
    reason?: string | null
    status?: "scheduled" | "executing" | "completed" | "cancelled"
    cancelled_at?: string | null
    completed_at?: string | null
  }
  Update: {
    status?: "scheduled" | "executing" | "completed" | "cancelled"
    cancelled_at?: string | null
    completed_at?: string | null
  }
  Relationships: []
}

/** Strongly-typed shape of `profiles.metadata` JSONB */
export interface ProfileMetadata {
  emergency_contact?: {
    name: string
    phone: string
    relationship?: string | null
  } | null
  notif_prefs?: {
    push_enabled?: boolean
    email_enabled?: boolean
    sms_enabled?: boolean
    daily_reminder_hour?: number | null
  } | null
  safety_country?: "FR" | "US" | "INTL" | null
  last_pro_consult_prompt_at?: string | null
}
