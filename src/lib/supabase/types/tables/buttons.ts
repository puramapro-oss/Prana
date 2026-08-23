import type { Json } from "../scalars"

export interface MagicButtonUsagesTable {
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
