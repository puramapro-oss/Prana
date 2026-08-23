/**
 * Main Database type — shape mirrors `supabase gen types typescript` output
 * to satisfy postgrest-js v12 GenericSchema constraint.
 *
 * Will be regenerated via `supabase gen types typescript` in P8.
 */

import type {
  ProfilesTable,
  LegalAcceptancesTable,
  CookieConsentsTable,
  AccountDeletionRequestsTable,
} from "./tables/profile"
import type { RoomsTable, RoomMembershipsTable, RoomMessagesTable } from "./tables/rooms"
import type {
  PulseChecksTable,
  RegulationProtocolsTable,
  RegulationSessionsTable,
} from "./tables/pulse"
import type {
  CapturesTable,
  ProjectsTable,
  PeopleTable,
  TasksTable,
  NotesTable,
} from "./tables/tasks"
import type {
  LifeosPlansTable,
  TwinProfilesTable,
  ExecutionsTable,
  DailyScoresTable,
} from "./tables/lifeos"
import type { UserPointsTable, PointEventsTable, ReferralsTable } from "./tables/points"
import type { SafetyEventsTable } from "./tables/safety"
import type { MagicButtonUsagesTable } from "./tables/buttons"

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12"
  }
  prana: {
    Tables: {
      profiles: ProfilesTable
      rooms: RoomsTable
      room_memberships: RoomMembershipsTable
      room_messages: RoomMessagesTable
      pulse_checks: PulseChecksTable
      regulation_protocols: RegulationProtocolsTable
      regulation_sessions: RegulationSessionsTable
      magic_button_usages: MagicButtonUsagesTable
      captures: CapturesTable
      projects: ProjectsTable
      people: PeopleTable
      tasks: TasksTable
      notes: NotesTable
      lifeos_plans: LifeosPlansTable
      twin_profiles: TwinProfilesTable
      executions: ExecutionsTable
      daily_scores: DailyScoresTable
      safety_events: SafetyEventsTable
      user_points: UserPointsTable
      point_events: PointEventsTable
      referrals: ReferralsTable
      legal_acceptances: LegalAcceptancesTable
      cookie_consents: CookieConsentsTable
      account_deletion_requests: AccountDeletionRequestsTable
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

/** Convenience alias — derived from Database to keep one source of truth */
export type PranaTables = Database["prana"]["Tables"]
