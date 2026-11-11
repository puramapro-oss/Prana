import { useMemo, useState } from "react"
import { View, Text, ScrollView, Pressable, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import * as Haptics from "expo-haptics"
import { ArrowRight, Lock } from "lucide-react-native"
import { GlassCard } from "@/components/GlassCard"
import { colors } from "@/lib/theme"
import {
  PROTOCOL_CATEGORIES,
  PROTOCOLS,
  type ProtocolCategory,
} from "../../../src/lib/regulate/protocols"
import { formatProtocolDuration } from "../../../src/lib/regulate/playback"

export default function RegulateScreen() {
  const router = useRouter()
  const [filter, setFilter] = useState<ProtocolCategory | "all">("all")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return PROTOCOLS.filter((protocol) => {
      if (filter !== "all" && protocol.category !== filter) return false
      if (!query) return true
      return (
        protocol.name_fr.toLowerCase().includes(query) ||
        protocol.description_fr.toLowerCase().includes(query)
      )
    })
  }, [filter, search])

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <Text className="text-primary text-xs uppercase tracking-wider mb-2">Réguler</Text>
        <Text className="text-ivory text-3xl font-heading mb-2">Protocoles du catalogue</Text>
        <Text className="text-muted text-[15px] mb-5">
          {PROTOCOLS.length} protocoles, les mêmes que sur le web. Le téléphone ne vérifie pas l'abonnement et n'enregistre pas la séance.
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Chercher un protocole"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Chercher un protocole"
          className="h-11 px-3 mb-4 rounded-xl border border-border bg-surface text-ivory"
        />

        <View className="flex-row gap-2 mb-6 flex-wrap">
          {PROTOCOL_CATEGORIES.map((category) => (
            <Pressable
              key={category.value}
              testID={`filter-${category.value}`}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {})
                setFilter(category.value)
              }}
              className={`h-9 px-3 rounded-full border items-center justify-center ${
                filter === category.value ? "bg-ivory border-ivory" : "bg-surface border-border"
              }`}
            >
              <Text className={`text-sm ${filter === category.value ? "text-bg font-semibold" : "text-ivory"}`}>
                {category.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {filtered.length === 0 ? (
          <Text className="text-muted text-sm py-8 text-center">Aucun protocole. Essaie un autre mot.</Text>
        ) : (
          <View className="gap-3">
            {filtered.map((protocol) => {
              const locked = protocol.base_plan !== "free"
              return (
                <Pressable
                  key={protocol.slug}
                  testID={`protocol-${protocol.slug}`}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                    router.push(`/protocol/${protocol.slug}`)
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${protocol.name_fr}, ${formatProtocolDuration(protocol.duration_seconds)}${
                    locked ? `, indiqué pour le plan ${protocol.base_plan}` : ""
                  }`}
                >
                  <GlassCard className="p-5">
                    <View className="flex-row gap-4 items-start">
                      <Text className="text-2xl" accessibilityElementsHidden>
                        {protocol.hero}
                      </Text>
                      <View className="flex-1">
                        <Text className="text-ivory text-base font-semibold">{protocol.name_fr}</Text>
                        <Text className="text-muted text-sm mt-0.5">{protocol.description_fr}</Text>
                        <Text className="text-muted text-xs mt-2">
                          {formatProtocolDuration(protocol.duration_seconds)} · {protocol.category}
                        </Text>
                      </View>
                      {locked ? (
                        <View className="flex-row items-center gap-1">
                          <Lock size={12} color={colors.muted} />
                          <Text className="text-muted text-[10px] uppercase">{protocol.base_plan}</Text>
                        </View>
                      ) : (
                        <ArrowRight size={16} color={colors.muted} />
                      )}
                    </View>
                  </GlassCard>
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
