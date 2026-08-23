/** Scalar types and common enums */

export type Plan = "free" | "starter" | "pro" | "ultime"
export type Locale = "fr" | "en"
export type TaskStatus = "todo" | "doing" | "done" | "dropped"
export type ProjectStatus = "active" | "paused" | "done" | "dropped"
export type EnergyRequired = "low" | "medium" | "high"
export type CaptureSource = "text" | "voice" | "image" | "email" | "share"
export type ExecutionType = "message" | "email" | "post" | "plan" | "doc" | "script"
export type SafetySeverity = "low" | "medium" | "high" | "critical"
export type SafetyTrigger =
  | "sos_button"
  | "classifier_flag"
  | "keyword_match"
  | "consult_prompt"
  | "user_self_report"
export type ReferralStatus = "pending" | "converted" | "rewarded"
export type TimeAvailable = "20s" | "2min" | "10min" | "1h"
export type PulseContext = "home" | "work" | "outside" | "transit" | "bed" | "other"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
