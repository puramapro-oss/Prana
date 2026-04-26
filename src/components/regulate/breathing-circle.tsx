"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ProtocolBreathStep } from "@/lib/regulate/protocols"

interface BreathingCircleProps {
  step: ProtocolBreathStep
  /** Called when the configured `repeats` are completed. */
  onComplete: () => void
  paused?: boolean
}

type Phase = "inhale" | "hold" | "exhale" | "hold_after"

const PHASE_COPY: Record<Phase, { label: string; sub: string }> = {
  inhale: { label: "Inspire", sub: "doucement par le nez" },
  hold: { label: "Retiens", sub: "calmement" },
  exhale: { label: "Expire", sub: "lentement par la bouche" },
  hold_after: { label: "Pause", sub: "" },
}

export function BreathingCircle({ step, onComplete, paused = false }: BreathingCircleProps) {
  const reduceMotion = useReducedMotion()
  const [cycle, setCycle] = useState(1)
  const [phase, setPhase] = useState<Phase>("inhale")
  const [secondsLeft, setSecondsLeft] = useState(step.inhale)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // The phase sequence depends on which durations exist.
  const phaseSeq: Phase[] = useMemo(() => {
    const seq: Phase[] = ["inhale"]
    if ((step.hold ?? 0) > 0) seq.push("hold")
    seq.push("exhale")
    if ((step.hold_after ?? 0) > 0) seq.push("hold_after")
    return seq
  }, [step.hold, step.hold_after])

  const phaseDurations = useMemo(
    (): Record<Phase, number> => ({
      inhale: step.inhale,
      hold: step.hold ?? 0,
      exhale: step.exhale,
      hold_after: step.hold_after ?? 0,
    }),
    [step.inhale, step.hold, step.exhale, step.hold_after],
  )

  // Reset state when the step changes.
  useEffect(() => {
    setCycle(1)
    setPhase("inhale")
    setSecondsLeft(step.inhale)
  }, [step])

  useEffect(() => {
    if (paused) return
    if (secondsLeft <= 0) {
      const idx = phaseSeq.indexOf(phase)
      const isLastPhase = idx === phaseSeq.length - 1
      if (isLastPhase) {
        if (cycle >= step.repeats) {
          onCompleteRef.current()
          return
        }
        setCycle((c) => c + 1)
        setPhase(phaseSeq[0])
        setSecondsLeft(phaseDurations[phaseSeq[0]])
      } else {
        const next = phaseSeq[idx + 1]
        setPhase(next)
        setSecondsLeft(phaseDurations[next])
      }
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft, phase, phaseSeq, phaseDurations, cycle, step.repeats, paused])

  const copy = PHASE_COPY[phase]

  // Circle scale per phase. Inhale → 1.0, exhale → 0.55, holds → freeze at last value.
  const scale = phase === "inhale" ? 1 : phase === "exhale" ? 0.55 : phase === "hold" ? 1 : 0.55
  const transitionDuration =
    phase === "inhale" ? step.inhale : phase === "exhale" ? step.exhale : 0.4

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <div className="relative flex items-center justify-center w-[260px] h-[260px] sm:w-[300px] sm:h-[300px]">
        {/* outer halo */}
        <div
          className="absolute inset-0 rounded-full bg-primary/5 blur-3xl"
          aria-hidden
        />
        <motion.div
          aria-hidden
          className={cn(
            "absolute rounded-full border border-primary/30",
            "bg-gradient-to-br from-primary/30 via-sky-500/20 to-transparent",
            "shadow-[0_0_60px_rgba(56,189,200,0.25)]",
          )}
          initial={{ scale: 0.55 }}
          animate={{ scale: reduceMotion ? 0.85 : scale }}
          transition={{ duration: reduceMotion ? 0.2 : transitionDuration, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: "85%", height: "85%" }}
        />
        <div className="relative text-center space-y-1.5">
          <div className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
            {copy.label}
          </div>
          <div className="font-mono tabular-nums text-5xl sm:text-6xl text-foreground/90">
            {Math.max(secondsLeft, 0)}
          </div>
          {copy.sub ? (
            <div className="text-xs text-muted-foreground">{copy.sub}</div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: step.repeats }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-1.5 rounded-full transition-colors",
              i < cycle - 1
                ? "bg-primary"
                : i === cycle - 1
                  ? "bg-primary/60 animate-pulse"
                  : "bg-border",
            )}
            aria-hidden
          />
        ))}
      </div>

      <div className="text-xs text-muted-foreground tabular-nums">
        Cycle {Math.min(cycle, step.repeats)} / {step.repeats}
      </div>
    </div>
  )
}
