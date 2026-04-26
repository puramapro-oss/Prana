/**
 * Background classifier runner.
 * Called fire-and-forget by the capture API right after a successful insert.
 *
 * Steps:
 *  1. Fetch the user's projects + people (cap to 50 each — for matching)
 *  2. Call haiku-4-5 with the capture raw_text + match candidates
 *  3. Update captures.classification + classified_at
 *  4. Materialize the capture into the right table:
 *      - "task"        → tasks (link source_capture_id)
 *      - "note"|"idea" → notes
 *      - "project"     → projects + a task to "kick off the project"
 *      - "person_note" → notes + person link
 *      - "ignore"      → just mark archived
 *
 * Failures are logged + the capture stays unclassified so the user can retry.
 */

import { createAdminClient } from "@/lib/supabase/admin"
import { askClaudeJSON } from "@/lib/agent/anthropic"
import {
  CLASSIFIER_SYSTEM,
  buildClassifierUserMessage,
  type ClassifierContext,
} from "@/lib/agent/prompts/lifeos-classifier"
import type {
  Capture,
  CaptureClassification,
  Person,
  Project,
} from "@/lib/supabase/types"

const RAW_RESULT_KEYS: ReadonlyArray<keyof CaptureClassification> = [
  "type",
  "priority",
  "suggested_title",
  "energy_required",
  "time_estimate_minutes",
  "project_match",
  "person_match",
  "tags",
  "reasoning",
]

function isClassificationLike(value: unknown): value is CaptureClassification {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return RAW_RESULT_KEYS.every((k) => k in v)
}

export async function classifyCapture(captureId: string): Promise<{
  ok: boolean
  classification?: CaptureClassification
  error?: string
}> {
  const admin = createAdminClient()

  const captureResp = await admin
    .from("captures")
    .select("id, user_id, raw_text, classified_at, archived")
    .eq("id", captureId)
    .maybeSingle()

  const capture = captureResp.data as Pick<
    Capture,
    "id" | "user_id" | "raw_text" | "classified_at" | "archived"
  > | null

  if (!capture) return { ok: false, error: "capture_not_found" }
  if (capture.classified_at) return { ok: false, error: "already_classified" }
  if (capture.archived) return { ok: false, error: "archived" }

  const [projectsResp, peopleResp] = await Promise.all([
    admin
      .from("projects")
      .select("id, name")
      .eq("user_id", capture.user_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("people")
      .select("id, name")
      .eq("user_id", capture.user_id)
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  const ctx: ClassifierContext = {
    projects: (projectsResp.data ?? []) as Pick<Project, "id" | "name">[],
    people: (peopleResp.data ?? []) as Pick<Person, "id" | "name">[],
  }

  let classification: CaptureClassification
  try {
    const raw = await askClaudeJSON<unknown>(
      buildClassifierUserMessage(capture.raw_text, ctx),
      {
        system: CLASSIFIER_SYSTEM,
        tier: "fast",
        maxTokens: 512,
        temperature: 0.2,
      },
    )
    if (!isClassificationLike(raw)) {
      return { ok: false, error: "invalid_classification_shape" }
    }
    classification = raw
  } catch (err) {
    console.error("[classifier] AI call failed", err)
    return { ok: false, error: "ai_call_failed" }
  }

  // Persist classification on the capture (whatever the type)
  await admin
    .from("captures")
    .update({
      classification: classification as unknown as Record<string, unknown>,
      classified_at: new Date().toISOString(),
    })
    .eq("id", captureId)

  // Materialize
  switch (classification.type) {
    case "task": {
      await admin.from("tasks").insert({
        user_id: capture.user_id,
        title: classification.suggested_title.slice(0, 120),
        description: capture.raw_text === classification.suggested_title ? null : capture.raw_text,
        priority: clampPriority(classification.priority),
        energy_required: classification.energy_required,
        time_estimate_minutes: classification.time_estimate_minutes,
        project_id: classification.project_match,
        person_id: classification.person_match,
        source_capture_id: capture.id,
      })
      break
    }
    case "person_note": {
      await admin.from("notes").insert({
        user_id: capture.user_id,
        title: classification.suggested_title.slice(0, 120),
        body: capture.raw_text,
        tags: classification.tags ?? [],
      })
      // Touch last_contact_at on the matched person if any
      if (classification.person_match) {
        await admin
          .from("people")
          .update({ last_contact_at: new Date().toISOString() })
          .eq("id", classification.person_match)
          .eq("user_id", capture.user_id)
      }
      break
    }
    case "note":
    case "idea": {
      await admin.from("notes").insert({
        user_id: capture.user_id,
        title: classification.suggested_title.slice(0, 120),
        body: capture.raw_text,
        tags: classification.tags ?? [],
      })
      break
    }
    case "project": {
      const projectInsert = await admin
        .from("projects")
        .insert({
          user_id: capture.user_id,
          name: classification.suggested_title.slice(0, 120),
          why: capture.raw_text === classification.suggested_title ? null : capture.raw_text,
          status: "active",
        })
        .select("id")
        .maybeSingle()
      const projectId = (projectInsert.data as { id: string } | null)?.id ?? null
      if (projectId) {
        await admin.from("tasks").insert({
          user_id: capture.user_id,
          title: `Lancer : ${classification.suggested_title.slice(0, 100)}`,
          priority: clampPriority(classification.priority),
          energy_required: classification.energy_required,
          project_id: projectId,
          source_capture_id: capture.id,
        })
      }
      break
    }
    case "ignore":
    default: {
      await admin.from("captures").update({ archived: true }).eq("id", captureId)
      break
    }
  }

  return { ok: true, classification }
}

function clampPriority(p: number): number {
  if (!Number.isFinite(p)) return 3
  if (p < 1) return 1
  if (p > 5) return 5
  return Math.round(p)
}
