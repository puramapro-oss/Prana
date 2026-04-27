import { useEffect, useState } from "react"
import { View, Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Flame, Activity, Heart, Sparkles } from "lucide-react-native"
import { GlassCard } from "@/components/GlassCard"
import { supabase } from "@/lib/supabase"
import { colors } from "@/lib/theme"

interface DailyScore {
  date: string
  calm_score: number
  energy_score: number
  focus_score: number
  streak_days: number
  pulse_count: number
  protocol_count: number
}

export default function ScoreScreen() {
  const [last7, setLast7] = useState<DailyScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void (async () => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)
      const { data } = await supabase
        .from("daily_scores")
        .select("date, calm_score, energy_score, focus_score, streak_days, pulse_count, protocol_count")
        .gte("date", sevenDaysAgo.toISOString().slice(0, 10))
        .order("date", { ascending: true })
        .limit(7)
      if (active) {
        setLast7((data as DailyScore[] | null) ?? [])
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const today = last7[last7.length - 1]
  const streak = today?.streak_days ?? 0
  const avgCalm = last7.length ? Math.round(last7.reduce((s, d) => s + (d.calm_score ?? 0), 0) / last7.length) : 0
  const avgEnergy = last7.length ? Math.round(last7.reduce((s, d) => s + (d.energy_score ?? 0), 0) / last7.length) : 0
  const avgFocus = last7.length ? Math.round(last7.reduce((s, d) => s + (d.focus_score ?? 0), 0) / last7.length) : 0

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View className="flex-row items-center gap-2 mb-2">
          <Sparkles size={14} color={colors.primary} />
          <Text className="text-primary text-xs uppercase tracking-wider">Ton score</Text>
        </View>
        <Text className="text-ivory text-3xl font-heading mb-6">7 derniers jours</Text>

        <GlassCard className="p-6 mb-4">
          <View className="flex-row items-center gap-3 mb-2">
            <Flame size={20} color={colors.primary} strokeWidth={1.6} />
            <Text className="text-muted text-xs uppercase tracking-wider">Série</Text>
          </View>
          <Text className="text-ivory text-5xl font-heading">{streak}</Text>
          <Text className="text-muted text-sm mt-1">
            jour{streak !== 1 ? "s" : ""} d&apos;affilée — {streak >= 7 ? "bravo" : "reprends quand tu veux"}
          </Text>
        </GlassCard>

        <View className="flex-row gap-3 mb-4">
          <Stat label="Calme" value={avgCalm} Icon={Heart} loading={loading} />
          <Stat label="Énergie" value={avgEnergy} Icon={Activity} loading={loading} />
          <Stat label="Focus" value={avgFocus} Icon={Sparkles} loading={loading} />
        </View>

        <GlassCard className="p-5">
          <Text className="text-muted text-xs uppercase tracking-wider mb-3">Évolution calme</Text>
          <SparkBar values={last7.map((d) => d.calm_score ?? 0)} />
          <Text className="text-muted text-xs mt-3">
            Calculé chaque nuit à partir de tes pulses et protocoles. Pas de jugement — juste un signal.
          </Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  )
}

function Stat({
  label,
  value,
  Icon,
  loading,
}: {
  label: string
  value: number
  Icon: typeof Heart
  loading: boolean
}) {
  return (
    <GlassCard className="flex-1 p-4">
      <Icon size={16} color={colors.primary} strokeWidth={1.6} />
      <Text className="text-muted text-xs uppercase tracking-wider mt-2">{label}</Text>
      <Text className="text-ivory text-2xl font-heading mt-1">
        {loading ? "—" : value}
        <Text className="text-muted text-sm">/100</Text>
      </Text>
    </GlassCard>
  )
}

function SparkBar({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  return (
    <View className="flex-row items-end h-20 gap-1.5">
      {values.length === 0 ? (
        <Text className="text-muted text-sm">Pas encore de données — fais un pulse pour démarrer.</Text>
      ) : (
        values.map((v, i) => (
          <View
            key={i}
            className="flex-1 bg-primary/30 rounded-sm"
            style={{ height: `${Math.max((v / max) * 100, 6)}%` }}
          />
        ))
      )}
    </View>
  )
}
