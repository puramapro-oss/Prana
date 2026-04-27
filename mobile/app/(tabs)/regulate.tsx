import { useEffect, useState } from "react"
import { View, Text, ScrollView, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import * as Haptics from "expo-haptics"
import { Wind, Heart, Brain, Zap, Moon, Sparkles, ArrowRight } from "lucide-react-native"
import { GlassCard } from "@/components/GlassCard"
import { colors } from "@/lib/theme"

interface Protocol {
  slug: string
  name: string
  durationSec: number
  category: string
  description: string
  Icon: typeof Wind
}

const PROTOCOLS: Protocol[] = [
  { slug: "478-breath", name: "Respiration 4-7-8", durationSec: 240, category: "calme", description: "Le grand classique anti-stress, en 4 cycles.", Icon: Wind },
  { slug: "box-breath", name: "Respiration carrée", durationSec: 180, category: "focus", description: "Préparation mentale type Navy SEAL — focus immédiat.", Icon: Brain },
  { slug: "physio-sigh", name: "Soupir physiologique", durationSec: 60, category: "calme", description: "Double inspiration + longue expiration. 60 secondes max.", Icon: Heart },
  { slug: "coherence", name: "Cohérence cardiaque", durationSec: 300, category: "calme", description: "5 minutes, 6 cycles/min. Validé scientifiquement.", Icon: Heart },
  { slug: "wim-hof-light", name: "Wim Hof léger", durationSec: 240, category: "energie", description: "Stimulation douce — 30 respirations + rétention.", Icon: Zap },
  { slug: "body-scan", name: "Scan corporel", durationSec: 360, category: "calme", description: "Détendre une à une chaque tension.", Icon: Brain },
  { slug: "grounding-5-4-3", name: "Ancrage 5-4-3-2-1", durationSec: 180, category: "calme", description: "Ramène-toi ici, en 5 sens.", Icon: Heart },
  { slug: "evening-wind-down", name: "Coucher apaisé", durationSec: 420, category: "sommeil", description: "Glissement vers le sommeil profond.", Icon: Moon },
  { slug: "morning-light", name: "Réveil énergisé", durationSec: 180, category: "energie", description: "Énergie sans café — 3 minutes.", Icon: Zap },
  { slug: "cold-mind", name: "Esprit froid", durationSec: 240, category: "focus", description: "Décision claire, calmement, sans surchauffe.", Icon: Brain },
  { slug: "panic-stop", name: "Stop-panique 60s", durationSec: 60, category: "calme", description: "Première vague d'angoisse — coupé en 60 secondes.", Icon: Heart },
  { slug: "post-conflict", name: "Après conflit", durationSec: 300, category: "calme", description: "Récupère après une dispute ou un mot dur.", Icon: Heart },
]

const CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "calme", label: "Calme" },
  { key: "focus", label: "Focus" },
  { key: "energie", label: "Énergie" },
  { key: "sommeil", label: "Sommeil" },
] as const

export default function RegulateScreen() {
  const router = useRouter()
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]["key"]>("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    // Reset search when filter changes
    setSearch("")
  }, [filter])

  const filtered = PROTOCOLS.filter((p) => {
    const matchCat = filter === "all" || p.category === filter
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View className="flex-row items-center gap-2 mb-2">
          <Sparkles size={14} color={colors.primary} />
          <Text className="text-primary text-xs uppercase tracking-wider">Réguler</Text>
        </View>
        <Text className="text-ivory text-3xl font-heading mb-2">12 protocoles guidés</Text>
        <Text className="text-muted text-[15px] mb-5">
          Calme, focus, énergie, sommeil. De 60 secondes à 7 minutes.
        </Text>

        <View className="flex-row gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.key}
              testID={`filter-${c.key}`}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {})
                setFilter(c.key)
              }}
              className={`h-9 px-3 rounded-full border items-center justify-center ${
                filter === c.key ? "bg-ivory border-ivory" : "bg-surface border-border"
              }`}
            >
              <Text className={`text-sm ${filter === c.key ? "text-bg font-semibold" : "text-ivory"}`}>
                {c.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="gap-3">
          {filtered.map((p) => {
            const Icon = p.Icon
            const minutes = Math.round(p.durationSec / 60)
            return (
              <Pressable
                key={p.slug}
                testID={`protocol-${p.slug}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                  router.push(`/protocol/${p.slug}`)
                }}
                accessibilityRole="button"
                accessibilityLabel={`Lancer ${p.name}, ${minutes} minutes`}
              >
                <GlassCard className="p-5">
                  <View className="flex-row gap-4 items-start">
                    <View className="size-10 rounded-full bg-primary/10 items-center justify-center">
                      <Icon size={18} color={colors.primary} strokeWidth={1.6} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-ivory text-base font-semibold">{p.name}</Text>
                      <Text className="text-muted text-sm mt-0.5">{p.description}</Text>
                      <Text className="text-muted text-xs mt-2">
                        {minutes < 1 ? `${p.durationSec}s` : `${minutes} min`} · {p.category}
                      </Text>
                    </View>
                    <ArrowRight size={16} color={colors.muted} />
                  </View>
                </GlassCard>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
