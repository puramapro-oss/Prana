/**
 * Supabase generated types — modularized for maintainability.
 * Will be regenerated via `supabase gen types typescript` in P8.
 *
 * Shape mirrors `supabase gen types typescript` output to satisfy
 * postgrest-js v12 GenericSchema constraint. CRITICAL: `Row` types must be
 * inline anonymous object literals (NOT named interfaces) to satisfy
 * `Record<string, unknown>` index signature compatibility.
 */

// === Re-export scalars ===
export type {
  Plan,
  Locale,
  TaskStatus,
  ProjectStatus,
  EnergyRequired,
  CaptureSource,
  ExecutionType,
  SafetySeverity,
  SafetyTrigger,
  ReferralStatus,
  TimeAvailable,
  PulseContext,
  Json,
} from "./scalars"

// === Re-export Database and PranaTables ===
export type { Database, PranaTables } from "./database"

// === Re-export table interfaces ===
export type {
  ProfilesTable,
  LegalAcceptancesTable,
  CookieConsentsTable,
  AccountDeletionRequestsTable,
  ProfileMetadata,
} from "./tables/profile"

export type { RoomsTable, RoomMembershipsTable, RoomMessagesTable, RoomDayAction } from "./tables/rooms"

export type {
  PulseChecksTable,
  RegulationProtocolsTable,
  RegulationSessionsTable,
} from "./tables/pulse"

export type {
  CapturesTable,
  ProjectsTable,
  PeopleTable,
  TasksTable,
  NotesTable,
  CaptureClassification,
} from "./tables/tasks"

export type {
  LifeosPlansTable,
  TwinProfilesTable,
  ExecutionsTable,
  DailyScoresTable,
  TwinCommunicationStyle,
  TwinWorkingHabits,
  TwinDecisionPatterns,
} from "./tables/lifeos"

export type { UserPointsTable, PointEventsTable, ReferralsTable } from "./tables/points"

export type { SafetyEventsTable } from "./tables/safety"

export type { MagicButtonUsagesTable } from "./tables/buttons"

// === Convenience type aliases (derived from PranaTables) ===
import type { PranaTables } from "./database"

export type Profile = PranaTables["profiles"]["Row"]
export type ProfileInsert = PranaTables["profiles"]["Insert"]
export type ProfileUpdate = PranaTables["profiles"]["Update"]

export type PulseCheck = PranaTables["pulse_checks"]["Row"]
export type PulseCheckInsert = PranaTables["pulse_checks"]["Insert"]

export type RegulationProtocol = PranaTables["regulation_protocols"]["Row"]
export type RegulationSession = PranaTables["regulation_sessions"]["Row"]
export type RegulationSessionInsert = PranaTables["regulation_sessions"]["Insert"]

export type MagicButtonUsage = PranaTables["magic_button_usages"]["Row"]
export type MagicButtonUsageInsert = PranaTables["magic_button_usages"]["Insert"]

export type Capture = PranaTables["captures"]["Row"]
export type CaptureInsert = PranaTables["captures"]["Insert"]
export type CaptureUpdate = PranaTables["captures"]["Update"]

export type Project = PranaTables["projects"]["Row"]
export type ProjectInsert = PranaTables["projects"]["Insert"]
export type ProjectUpdate = PranaTables["projects"]["Update"]

export type Person = PranaTables["people"]["Row"]
export type PersonInsert = PranaTables["people"]["Insert"]
export type PersonUpdate = PranaTables["people"]["Update"]

export type Task = PranaTables["tasks"]["Row"]
export type TaskInsert = PranaTables["tasks"]["Insert"]
export type TaskUpdate = PranaTables["tasks"]["Update"]

export type Note = PranaTables["notes"]["Row"]
export type NoteInsert = PranaTables["notes"]["Insert"]
export type NoteUpdate = PranaTables["notes"]["Update"]

export type LifeosPlan = PranaTables["lifeos_plans"]["Row"]
export type LifeosPlanInsert = PranaTables["lifeos_plans"]["Insert"]
export type LifeosPlanUpdate = PranaTables["lifeos_plans"]["Update"]

export type Execution = PranaTables["executions"]["Row"]
export type ExecutionInsert = PranaTables["executions"]["Insert"]
export type ExecutionUpdate = PranaTables["executions"]["Update"]

export type TwinProfile = PranaTables["twin_profiles"]["Row"]
export type TwinProfileInsert = PranaTables["twin_profiles"]["Insert"]
export type TwinProfileUpdate = PranaTables["twin_profiles"]["Update"]

export type DailyScore = PranaTables["daily_scores"]["Row"]
export type DailyScoreInsert = PranaTables["daily_scores"]["Insert"]
export type DailyScoreUpdate = PranaTables["daily_scores"]["Update"]

export type SafetyEvent = PranaTables["safety_events"]["Row"]
export type SafetyEventInsert = PranaTables["safety_events"]["Insert"]

export type UserPoints = PranaTables["user_points"]["Row"]
export type UserPointsInsert = PranaTables["user_points"]["Insert"]
export type UserPointsUpdate = PranaTables["user_points"]["Update"]

export type PointEvent = PranaTables["point_events"]["Row"]
export type PointEventInsert = PranaTables["point_events"]["Insert"]

export type Referral = PranaTables["referrals"]["Row"]
export type ReferralInsert = PranaTables["referrals"]["Insert"]
export type ReferralUpdate = PranaTables["referrals"]["Update"]

export type Room = PranaTables["rooms"]["Row"]
export type RoomInsert = PranaTables["rooms"]["Insert"]
export type RoomUpdate = PranaTables["rooms"]["Update"]

export type RoomMembership = PranaTables["room_memberships"]["Row"]
export type RoomMembershipInsert = PranaTables["room_memberships"]["Insert"]
export type RoomMembershipUpdate = PranaTables["room_memberships"]["Update"]

export type RoomMessage = PranaTables["room_messages"]["Row"]
export type RoomMessageInsert = PranaTables["room_messages"]["Insert"]
