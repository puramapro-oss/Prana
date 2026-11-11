import type { ProtocolBreathStep, ProtocolDefinition, ProtocolStep } from "./protocols"

export type BreathPhase = "inhale" | "hold" | "exhale" | "hold_after"

export type PlaybackStatus = "ready" | "running" | "paused" | "interrupted" | "done"

export interface PlaybackBeat {
  stepIndex: number
  repeat: number
  repeats: number
  phase: BreathPhase | null
  label: string
  detail: string | null
  durationSec: number
  scale: number
}

export interface PlaybackState {
  status: PlaybackStatus
  beatIndex: number
  secondsLeft: number
  notice: string | null
}

const PHASE_LABEL: Record<BreathPhase, string> = {
  inhale: "Inspire",
  hold: "Retiens",
  exhale: "Expire",
  hold_after: "Retiens",
}

const INTERRUPT_NOTICE = "Séance interrompue. Tu peux reprendre au même instant."

export function formatProtocolDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "durée inconnue"
  if (seconds < 60) return `${Math.round(seconds)} s`
  const minutes = Math.round(seconds / 60)
  return `${minutes} min`
}

export function breathPhases(step: ProtocolBreathStep): BreathPhase[] {
  const phases: BreathPhase[] = ["inhale"]
  if ((step.hold ?? 0) > 0) phases.push("hold")
  phases.push("exhale")
  if ((step.hold_after ?? 0) > 0) phases.push("hold_after")
  return phases
}

function phaseDuration(step: ProtocolBreathStep, phase: BreathPhase): number {
  if (phase === "inhale") return step.inhale
  if (phase === "hold") return step.hold ?? 0
  if (phase === "exhale") return step.exhale
  return step.hold_after ?? 0
}

function phaseScale(phase: BreathPhase): number {
  return phase === "inhale" || phase === "hold" ? 1.6 : 1
}

function pushBeat(
  beats: PlaybackBeat[],
  beat: Omit<PlaybackBeat, "durationSec"> & { durationSec: number },
): void {
  if (!Number.isFinite(beat.durationSec) || beat.durationSec <= 0) return
  beats.push(beat)
}

function pushStep(beats: PlaybackBeat[], step: ProtocolStep, stepIndex: number): void {
  if (step.type === "breath") {
    const repeats = Math.max(0, Math.floor(step.repeats))
    const phases = breathPhases(step)
    for (let repeat = 1; repeat <= repeats; repeat += 1) {
      for (const phase of phases) {
        const durationSec = phaseDuration(step, phase)
        pushBeat(beats, {
          stepIndex,
          repeat,
          repeats,
          phase,
          label: `${PHASE_LABEL[phase]} ${durationSec}s`,
          detail: step.label,
          durationSec,
          scale: phaseScale(phase),
        })
      }
    }
    return
  }
  pushBeat(beats, {
    stepIndex,
    repeat: 1,
    repeats: 1,
    phase: null,
    label: step.label,
    detail: null,
    durationSec: step.duration_seconds,
    scale: 1,
  })
}

export function expandProtocol(protocol: ProtocolDefinition): PlaybackBeat[] {
  const beats: PlaybackBeat[] = []
  protocol.steps.forEach((step, stepIndex) => pushStep(beats, step, stepIndex))
  return beats
}

export function initialPlayback(beats: readonly PlaybackBeat[]): PlaybackState {
  const first = beats[0]
  if (!first) {
    return {
      status: "done",
      beatIndex: 0,
      secondsLeft: 0,
      notice: "Ce protocole n'a aucune étape à jouer.",
    }
  }
  return { status: "ready", beatIndex: 0, secondsLeft: first.durationSec, notice: null }
}

export function startPlayback(state: PlaybackState, beats: readonly PlaybackBeat[]): PlaybackState {
  if (state.status !== "ready") return state
  const beat = beats[state.beatIndex] ?? beats[0]
  if (!beat) return state
  return { status: "running", beatIndex: beats[state.beatIndex] ? state.beatIndex : 0, secondsLeft: beat.durationSec, notice: null }
}

export function pausePlayback(state: PlaybackState): PlaybackState {
  if (state.status !== "running") return state
  return { ...state, status: "paused", notice: null }
}

export function resumePlayback(state: PlaybackState): PlaybackState {
  if (state.status !== "paused" && state.status !== "interrupted") return state
  return { ...state, status: "running", notice: null }
}

export function interruptPlayback(state: PlaybackState): PlaybackState {
  if (state.status !== "running") return state
  return { ...state, status: "interrupted", notice: INTERRUPT_NOTICE }
}

export function tickPlayback(state: PlaybackState, beats: readonly PlaybackBeat[]): PlaybackState {
  if (state.status !== "running") return state
  if (state.secondsLeft > 1) return { ...state, secondsLeft: state.secondsLeft - 1 }
  const nextIndex = state.beatIndex + 1
  const next = beats[nextIndex]
  if (!next) return { status: "done", beatIndex: state.beatIndex, secondsLeft: 0, notice: null }
  return { status: "running", beatIndex: nextIndex, secondsLeft: next.durationSec, notice: null }
}
