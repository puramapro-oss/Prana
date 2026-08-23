import type { Json, CaptureSource, ProjectStatus, TaskStatus, EnergyRequired } from "../scalars"

export interface CapturesTable {
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

export interface ProjectsTable {
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

export interface PeopleTable {
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

export interface TasksTable {
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

export interface NotesTable {
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

/** Classification output from the LifeOS classifier (haiku-4-5) */
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
