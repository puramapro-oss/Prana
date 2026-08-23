import type { SafetyTrigger, SafetySeverity } from "../scalars"

export interface SafetyEventsTable {
  Row: {
    id: string
    user_id: string | null
    trigger: SafetyTrigger
    severity: SafetySeverity | null
    context_text: string | null
    hotlines_shown: string[] | null
    pro_referred: boolean
    created_at: string
  }
  Insert: {
    id?: string
    user_id?: string | null
    trigger: SafetyTrigger
    severity?: SafetySeverity | null
    context_text?: string | null
    hotlines_shown?: string[] | null
    pro_referred?: boolean
    created_at?: string
  }
  Update: {
    severity?: SafetySeverity | null
    context_text?: string | null
    hotlines_shown?: string[] | null
    pro_referred?: boolean
  }
  Relationships: []
}
