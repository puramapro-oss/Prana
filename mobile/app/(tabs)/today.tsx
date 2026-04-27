import { useEffect, useState } from "react"
import { View, Text, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import * as Haptics from "expo-haptics"
import { Sparkles, Activity, Wind } from "lucide-react-native"
import { Button } from "@/components/Button"
import { GlassCard } from "@/components/GlassCard"
import { PulseSlider } from "@/components/PulseSlider"
import { useCreatePulse, fetchLastPulse, type PulseCheckRow } from "@/hooks/usePulse"
import { useAuth } from "@/hooks/useAuth"
import { colors } from "@/lib/theme"

const FRESH_WINDOW_MIN = 90

function isFresh(row: PulseCheckRow | null): boolean {
  if (!row) return false
  const age = Date.now() - new Date(row.created_at).getTime()
  return age < FRESH_WINDOW_MIN * 60_000
}

function suggestion(stress: number, energy: number): { title: string; cta: string; route: string } {
  if (stress >= 4) return { title: "Respire 4-7-8 — 1 minute", cta: "Lancer", route: "/(tabs)/regulate" }
  if (energy <= 2) return { title: "Marche douce 3 minutes", cta: "Lancer", route: "/(tabs)/regulate" }
  return { title: "Pulse rapide — un check", cta: "Faire", route: "/(tabs)/today" }
}

export default function TodayScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [last, setLast] = useState<PulseCheckRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [stress, setStress] = useState(3)
  const [energy, setEnergy] = useState(3)
  const { submit, pending } = useCreatePulse()

  useEffect(() => {
    let active = true
    fetchLastPulse().then((r) => {
      if (!active) return
      setLast(r)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const onSubmit = async () => {
    const row = await submit({ stressLevel: stress, energyLevel: energy })
    if (row) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      setLast(row)
    } else {
      Alert.alert("Erreur", "Impossible d'enregistrer le pulse. Réessaie.")
    }
  }

  const fresh = isFresh(last)
  const sg = fresh && last ? suggestion(last.stress_level, last.energy_level) : null

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View className="flex-row items-center gap-2 mb-2">
          <Sparkles size={14} color={colors.primary} />
          <Text className="text-primary text-xs uppercase tracking-wider">Aujourd&apos;hui</Text>
        </View>
        <Text className="text-ivory text-3xl font-heading mb-1">
          Bonjour{user?.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ""}.
        </Text>
        <Text className="text-muted text-[15px] mb-6">Une seule action. C&apos;est tout.</Text>

        {loading ? null : fresh && sg ? (
          <GlassCard className="p-6 mb-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Activity size={16} color={colors.primary} strokeWidth={1.6} />
              <Text className="text-muted text-xs uppercase tracking-wider">Suggestion</Text>
            </View>
            <Text className="text-ivory text-xl font-heading mb-4">{sg.title}</Text>
            <Button testID="today-cta" onPress={() => router.push(sg.route)}>
              {sg.cta}
            </Button>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 mb-4">
            <Text className="text-muted text-xs uppercase tracking-wider mb-4">Pulse du jour</Text>
            <View className="gap-5">
              <PulseSlider
                testID="pulse-stress"
                label="Stress (1=très calme · 5=très tendu)"
                value={stress}
                onChange={setStress}
                emojis={["😌", "🙂", "😐", "😟", "😣"]}
              />
              <PulseSlider
                testID="pulse-energy"
                label="Énergie (1=épuisé·e · 5=plein·e d'énergie)"
                value={energy}
                onChange={setEnergy}
              />
              <Button testID="pulse-submit" onPress={onSubmit} loading={pending}>
                Enregistrer
              </Button>
            </View>
          </GlassCard>
        )}

        <GlassCard className="p-6 mb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Wind size={16} color={colors.primary} strokeWidth={1.6} />
            <Text className="text-muted text-xs uppercase tracking-wider">Boutons magiques</Text>
          </View>
          <Text className="text-ivory text-base mb-4">
            12 actions guidées par l&apos;IA pour stabiliser un état précis.
          </Text>
          <Button
            testID="open-magic"
            onPress={() => router.push("/(tabs)/regulate")}
            variant="secondary"
          >
            Ouvrir les boutons
          </Button>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  )
}
