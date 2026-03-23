/* ------------------------------------------------------------------ */
/*  Domain types matching the Supabase database schema                */
/* ------------------------------------------------------------------ */

export type Plan = 'free' | 'seed' | 'bloom' | 'ascend';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  dosha: string | null;
  mtc_type: string | null;
  spiritual_archetype: string | null;
  onboarding_completed: boolean;
  golden_hour_enabled: boolean;
  sound_enabled: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PracticeBlock {
  title: string;
  duration: number;
  description: string;
  technique?: string;
  pillar?: string;
}

export interface Programme {
  id: string;
  user_id: string;
  goal: string | null;
  level: string | null;
  challenges: string[];
  time_available: string | null;
  spiritual_practices: string[];
  morning_practices: PracticeBlock[];
  afternoon_practices: PracticeBlock[];
  evening_practices: PracticeBlock[];
  active_pillars: string[];
  active_techniques: Record<string, unknown>;
  ia_message: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string;
  completed_practices: Record<string, boolean>;
  sleep_score: number | null;
  energy_score: number | null;
  nutrition_score: number | null;
  practice_score: number | null;
  overall_score: number | null;
  mood: string | null;
  notes: string | null;
  lunar_phase: string | null;
  season: string | null;
  created_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  messages: Message[];
  context: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScanResult {
  id: string;
  user_id: string;
  dosha: string | null;
  mtc_type: string | null;
  microbiome_profile: string | null;
  nutritional_gaps: string[];
  stress_level: string | null;
  spiritual_archetype: string | null;
  full_analysis: Record<string, unknown>;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Supabase Database type map (used with createClient<Database>)     */
/* ------------------------------------------------------------------ */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      programmes: {
        Row: Programme;
        Insert: Omit<Programme, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Programme, 'id'>>;
      };
      daily_checkins: {
        Row: DailyCheckin;
        Insert: Omit<DailyCheckin, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DailyCheckin, 'id'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Conversation, 'id'>>;
      };
      scan_results: {
        Row: ScanResult;
        Insert: Omit<ScanResult, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ScanResult, 'id'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      plan: Plan;
    };
  };
}
