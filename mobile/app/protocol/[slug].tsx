import { useEffect, useMemo, useState } from "react"
import { View, Text, Pressable, AppState } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as Haptics from "expo-haptics"
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { ArrowLeft } from "lucide-react-native"
import { Button } from "@/components/Button"
import { colors } from "@/lib/theme"
import { findProtocol } from "../../../src/lib/regulate/protocols"
import {
  expandProtocol,
  initialPlayback,
  interruptPlayback,
  pausePlayback,
  resumePlayback,
  startPlayback,
  tickPlayback,
  type PlaybackState,
} from "../../../src/lib/regulate/playback"

function slugParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

export default function ProtocolPlayer() {
  const params = useLocalSearchParams<{ slug: string | string[] }>()
  const slug = slugParam(params.slug)
  const router = useRouter()
  const protocol = useMemo(() => (slug ? findProtocol(slug) : null), [slug])
  const beats = useMemo(() => (protocol ? expandProtocol(protocol) : []), [protocol])
  const [playback, setPlayback] = useState<PlaybackState>(() => initialPlayback(beats))
  const scale = useSharedValue(1)

  useEffect(() => {
    setPlayback(initialPlayback(beats))
  }, [beats])

  useEffect(() => {
    if (playback.status !== "running") return
    const timer = setInterval(() => {
      setPlayback((current) => tickPlayback(current, beats))
    }, 1000)
    return () => clearInterval(timer)
  }, [beats, playback.status])

  useEffect(() => {
    if (playback.status !== "running") return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {})
  }, [playback.beatIndex, playback.status])

  useEffect(() => {
    const beat = beats[playback.beatIndex]
    if (playback.status !== "running" || !beat) {
      cancelAnimation(scale)
      return
    }
    scale.value = withTiming(beat.scale, {
      duration: Math.max(playback.secondsLeft, 0) * 1000,
      easing: Easing.inOut(Easing.cubic),
    })
  }, [beats, playback.beatIndex, playback.status, scale])

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") setPlayback((current) => interruptPlayback(current))
    })
    return () => sub.remove()
  }, [])

  const beat = beats[playback.beatIndex]
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-bg">
      <View className="px-6 pt-2">
        <Pressable
          testID="protocol-back"
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          className="min-h-11 min-w-11 items-center justify-center"
        >
          <ArrowLeft size={20} color={colors.ivory} />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-6 gap-6">
        {!protocol ? (
          <>
            <Text className="text-ivory text-2xl font-heading text-center">Protocole introuvable</Text>
            <Text className="text-muted text-center max-w-xs">
              « {slug || "vide"} » ne fait pas partie du catalogue PRANA. Aucune séance de remplacement n'est lancée.
            </Text>
            <Button testID="protocol-missing" haptic={false} onPress={() => router.back()}>
              Retour à la liste
            </Button>
          </>
        ) : playback.status === "done" ? (
          <>
            <Text className="text-ivory text-2xl font-heading text-center">
              {playback.notice ?? "Terminé."}
            </Text>
            <Text className="text-muted text-center max-w-xs">
              {playback.notice
                ? "Rien n'a été joué."
                : "La séance reste sur cet appareil. Elle n'est pas enregistrée sur le compte."}
            </Text>
            <Button testID="protocol-done" haptic={false} onPress={() => router.replace("/(tabs)/today")}>
              Retour à aujourd'hui
            </Button>
          </>
        ) : (
          <>
            <Text className="text-primary text-xs uppercase tracking-wider">{protocol.name_fr}</Text>
            {playback.status === "ready" ? (
              <>
                <Text className="text-ivory text-center text-lg">{protocol.description_fr}</Text>
                <Text className="text-muted text-center max-w-xs">
                  Hors connexion, seules ces étapes déjà incluses sont disponibles. La vibration peut manquer sans empêcher la séance.
                </Text>
                <Button
                  testID="protocol-start"
                  haptic={false}
                  disabled={beats.length === 0}
                  onPress={() => setPlayback((current) => startPlayback(current, beats))}
                >
                  Démarrer
                </Button>
              </>
            ) : (
              <>
                <Animated.View
                  style={animStyle}
                  accessibilityRole="timer"
                  accessibilityLabel={
                    beat
                      ? `${beat.label}, ${playback.secondsLeft} secondes restantes`
                      : "Lecture du protocole"
                  }
                  className="size-56 rounded-full bg-primary/30 items-center justify-center px-4"
                >
                  <Text className="text-ivory text-lg font-heading text-center">{beat?.label}</Text>
                  <Text className="text-ivory text-4xl font-heading mt-1">{playback.secondsLeft}</Text>
                </Animated.View>
                {beat?.detail ? <Text className="text-muted text-center max-w-xs">{beat.detail}</Text> : null}
                {playback.notice ? (
                  <Text accessibilityRole="alert" className="text-ivory text-center max-w-xs">
                    {playback.notice}
                  </Text>
                ) : (
                  <Text className="text-muted text-sm">
                    Étape {(beat?.stepIndex ?? 0) + 1} / {protocol.steps.length}
                  </Text>
                )}
                <Button
                  testID={playback.status === "running" ? "protocol-pause" : "protocol-resume"}
                  haptic={false}
                  accessibilityLabel={playback.status === "running" ? "Mettre en pause" : "Reprendre"}
                  onPress={() =>
                    setPlayback((current) =>
                      current.status === "running" ? pausePlayback(current) : resumePlayback(current),
                    )
                  }
                >
                  {playback.status === "running" ? "Pause" : "Reprendre"}
                </Button>
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  )
}
