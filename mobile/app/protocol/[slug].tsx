import { useEffect, useMemo, useRef, useState } from "react"
import { View, Text, Pressable, AppState } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as Haptics from "expo-haptics"
import { ArrowLeft, Pause, Play, X } from "lucide-react-native"
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } from "react-native-reanimated"
import { Button } from "@/components/Button"
import { colors } from "@/lib/theme"

interface Step {
  label: string
  durationSec: number
  scale: number
}

interface Protocol {
  slug: string
  name: string
  steps: Step[]
}

const PROTOCOLS: Record<string, Protocol> = {
  "478-breath": {
    slug: "478-breath",
    name: "Respiration 4-7-8",
    steps: [
      { label: "Inspire 4s", durationSec: 4, scale: 1.6 },
      { label: "Retiens 7s", durationSec: 7, scale: 1.6 },
      { label: "Expire 8s", durationSec: 8, scale: 1.0 },
    ],
  },
  "box-breath": {
    slug: "box-breath",
    name: "Respiration carrée",
    steps: [
      { label: "Inspire 4s", durationSec: 4, scale: 1.6 },
      { label: "Retiens 4s", durationSec: 4, scale: 1.6 },
      { label: "Expire 4s", durationSec: 4, scale: 1.0 },
      { label: "Retiens 4s", durationSec: 4, scale: 1.0 },
    ],
  },
  "physio-sigh": {
    slug: "physio-sigh",
    name: "Soupir physiologique",
    steps: [
      { label: "1ère inspiration", durationSec: 2, scale: 1.4 },
      { label: "2ème inspiration courte", durationSec: 1, scale: 1.6 },
      { label: "Longue expiration", durationSec: 6, scale: 1.0 },
    ],
  },
  "coherence": {
    slug: "coherence",
    name: "Cohérence cardiaque",
    steps: [
      { label: "Inspire 5s", durationSec: 5, scale: 1.6 },
      { label: "Expire 5s", durationSec: 5, scale: 1.0 },
    ],
  },
}

const FALLBACK: Protocol = {
  slug: "fallback",
  name: "Respiration calme",
  steps: [
    { label: "Inspire 4s", durationSec: 4, scale: 1.6 },
    { label: "Expire 6s", durationSec: 6, scale: 1.0 },
  ],
}

export default function ProtocolPlayer() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const proto = useMemo(() => (slug && PROTOCOLS[slug as string]) || FALLBACK, [slug])

  const [phase, setPhase] = useState<"before" | "running" | "done">("before")
  const [stepIdx, setStepIdx] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(proto.steps[0]?.durationSec ?? 0)
  const cyclesRef = useRef(0)
  const targetCycles = 6

  const scale = useSharedValue(1)

  useEffect(() => {
    if (phase !== "running") return
    const step = proto.steps[stepIdx]
    if (!step) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {})

    cancelAnimation(scale)
    scale.value = withTiming(step.scale, {
      duration: step.durationSec * 1000,
      easing: Easing.inOut(Easing.cubic),
    })

    setSecondsLeft(step.durationSec)
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tick)
          return 0
        }
        return s - 1
      })
    }, 1000)
    const next = setTimeout(() => {
      const isLastStep = stepIdx >= proto.steps.length - 1
      if (isLastStep) {
        cyclesRef.current += 1
        if (cyclesRef.current >= targetCycles) {
          setPhase("done")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
          return
        }
        setStepIdx(0)
      } else {
        setStepIdx((i) => i + 1)
      }
    }, step.durationSec * 1000)

    return () => {
      clearInterval(tick)
      clearTimeout(next)
    }
  }, [phase, stepIdx, proto.steps, scale])

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" && phase === "running") setPhase("before")
    })
    return () => sub.remove()
  }, [phase])

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-bg">
      <View className="px-6 pt-2 flex-row justify-between">
        <Pressable
          testID="protocol-back"
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          className="size-10 items-center justify-center"
        >
          <ArrowLeft size={20} color={colors.ivory} />
        </Pressable>
        {phase !== "before" ? (
          <Pressable
            testID="protocol-stop"
            onPress={() => router.back()}
            className="size-10 items-center justify-center"
          >
            <X size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <View className="flex-1 items-center justify-center px-6 gap-6">
        <Text className="text-primary text-xs uppercase tracking-wider">{proto.name}</Text>

        {phase === "before" ? (
          <>
            <Animated.View
              className="size-48 rounded-full bg-primary/20 items-center justify-center"
            >
              <Text className="text-ivory text-base">Prêt·e ?</Text>
            </Animated.View>
            <Text className="text-muted text-center max-w-xs">
              Trouve une position confortable. Suit le rond. Pas besoin de réussir, juste de suivre.
            </Text>
            <Button testID="protocol-start" onPress={() => setPhase("running")}>
              Démarrer
            </Button>
          </>
        ) : phase === "running" ? (
          <>
            <Animated.View
              style={animStyle}
              className="size-56 rounded-full bg-primary/30 items-center justify-center"
            >
              <Text className="text-ivory text-lg font-heading">{proto.steps[stepIdx]?.label}</Text>
              <Text className="text-ivory text-4xl font-heading mt-1">{secondsLeft}</Text>
            </Animated.View>
            <Text className="text-muted text-sm">
              Cycle {cyclesRef.current + 1} / {targetCycles}
            </Text>
          </>
        ) : (
          <>
            <View className="size-48 rounded-full bg-primary/30 items-center justify-center">
              <Text className="text-ivory text-3xl font-heading">✓</Text>
            </View>
            <Text className="text-ivory text-2xl font-heading text-center">Terminé.</Text>
            <Text className="text-muted text-center max-w-xs">
              Comment te sens-tu ? Note ton pulse pour qu&apos;on personnalise la suite.
            </Text>
            <Button testID="protocol-done" onPress={() => router.replace("/(tabs)/today")}>
              Retour à aujourd&apos;hui
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}
