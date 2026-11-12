import assert from "node:assert/strict"
import { describe, it } from "vitest"
import {
  expandProtocol,
  formatProtocolDuration,
  initialPlayback,
  interruptPlayback,
  pausePlayback,
  resumePlayback,
  startPlayback,
  tickPlayback,
  type PlaybackBeat,
} from "./playback"
import { categoryLabel, findProtocol, PROTOCOLS, type ProtocolBreathStep, type ProtocolDefinition } from "./protocols"

function breath(slug: string): ProtocolBreathStep {
  const protocol = findProtocol(slug)
  assert.ok(protocol)
  const step = protocol.steps.find((item) => item.type === "breath")
  assert.ok(step && step.type === "breath")
  return step
}

describe("catalogue mobile et web", () => {
  it("refuse les anciens slugs inventés par l'écran mobile", () => {
    for (const slug of ["478-breath", "box-breath", "physio-sigh", "coherence", "panic-stop"]) {
      assert.equal(findProtocol(slug), null)
    }
  })

  it("retrouve la respiration carrée sous son slug canonique", () => {
    const protocol = findProtocol("box-breathing")
    assert.ok(protocol)
    assert.equal(protocol.name_fr, "Respiration carrée")
    const step = breath("box-breathing")
    const beats = expandProtocol(protocol)
    const phases = 2 + ((step.hold ?? 0) > 0 ? 1 : 0) + ((step.hold_after ?? 0) > 0 ? 1 : 0)
    assert.equal(beats.length, phases * step.repeats)
    assert.deepEqual(
      beats.slice(0, 4).map((beat) => beat.phase),
      ["inhale", "hold", "exhale", "hold_after"],
    )
    assert.equal(beats[0]?.durationSec, step.inhale)
    assert.equal(beats[2]?.durationSec, step.exhale)
  })
})

describe("interruption et reprise", () => {
  const beats: PlaybackBeat[] = [
    { stepIndex: 0, repeat: 1, repeats: 1, phase: "inhale", label: "Inspire 4s", detail: null, durationSec: 4, scale: 1.6 },
    { stepIndex: 0, repeat: 1, repeats: 1, phase: "exhale", label: "Expire 6s", detail: null, durationSec: 6, scale: 1 },
  ]

  it("la pause et une seconde interruption ne font pas avancer le temps", () => {
    let state = startPlayback(initialPlayback(beats), beats)
    state = tickPlayback(state, beats)
    assert.equal(state.secondsLeft, 3)
    const paused = pausePlayback(state)
    assert.equal(pausePlayback(paused), paused)
    assert.equal(tickPlayback(paused, beats), paused)
    const interrupted = interruptPlayback(state)
    assert.equal(interrupted.status, "interrupted")
    assert.equal(interrupted.secondsLeft, 3)
    assert.equal(interruptPlayback(interrupted), interrupted)
    assert.equal(tickPlayback(interrupted, beats), interrupted)
    const resumed = resumePlayback(interrupted)
    assert.equal(resumed.status, "running")
    assert.equal(resumed.secondsLeft, 3)
    assert.equal(resumed.notice, null)
  })

  it("termine seulement après la dernière seconde du dernier temps", () => {
    let state = startPlayback(initialPlayback(beats), beats)
    state = { ...state, beatIndex: 1, secondsLeft: 1 }
    state = tickPlayback(state, beats)
    assert.equal(state.status, "done")
    assert.equal(startPlayback(state, beats), state)
  })

  it("la pause puis la reprise gardent la seconde en cours", () => {
    let state = startPlayback(initialPlayback(beats), beats)
    state = tickPlayback(state, beats)
    state = resumePlayback(pausePlayback(state))
    assert.equal(state.status, "running")
    assert.equal(state.secondsLeft, 3)
    assert.equal(state.beatIndex, 0)
  })

  it("affiche les durées sans arrondir une minute et demie à deux minutes", () => {
    assert.equal(formatProtocolDuration(90), "1 min 30 s")
    assert.equal(formatProtocolDuration(120), "2 min")
    assert.equal(formatProtocolDuration(30), "30 s")
    assert.equal(formatProtocolDuration(59.6), "1 min")
    assert.equal(formatProtocolDuration(Number.NaN), "durée inconnue")
    assert.equal(formatProtocolDuration(-4), "durée inconnue")
  })

  it("nomme les catégories en français", () => {
    assert.equal(categoryLabel("anxiety"), "Anxiété")
    assert.equal(categoryLabel("all"), "Tout")
  })

  it("ignore une phase de durée nulle et joue tout le catalogue", () => {
    const protocol = findProtocol("box-breathing")
    assert.ok(protocol)
    const step = breath("box-breathing")
    const stripped: ProtocolDefinition = {
      ...protocol,
      steps: [{ ...step, hold: 0, hold_after: 0 }],
    }
    const phases = expandProtocol(stripped).map((beat) => beat.phase)
    assert.deepEqual(phases.slice(0, 2), ["inhale", "exhale"])
    assert.equal(phases.includes("hold"), false)
    for (const item of PROTOCOLS) {
      const playable = expandProtocol(item)
      assert.ok(playable.length > 0, item.slug)
      assert.ok(playable.every((beat) => beat.durationSec > 0), item.slug)
    }
  })

  it("un protocole sans étape jouable ne démarre pas", () => {
    const protocol = findProtocol("stop-stress")
    assert.ok(protocol)
    const empty = expandProtocol({ ...protocol, steps: [] })
    const state = initialPlayback(empty)
    assert.equal(state.status, "done")
    assert.match(state.notice ?? "", /aucune étape/)
  })
})
