import assert from "node:assert/strict"
import { describe, it } from "vitest"
import {
  expandProtocol,
  initialPlayback,
  interruptPlayback,
  pausePlayback,
  resumePlayback,
  startPlayback,
  tickPlayback,
  type PlaybackBeat,
} from "./playback"
import { findProtocol, type ProtocolBreathStep } from "./protocols"

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

  it("un protocole sans étape jouable ne démarre pas", () => {
    const protocol = findProtocol("stop-stress")
    assert.ok(protocol)
    const empty = expandProtocol({ ...protocol, steps: [] })
    const state = initialPlayback(empty)
    assert.equal(state.status, "done")
    assert.match(state.notice ?? "", /aucune étape/)
  })
})
