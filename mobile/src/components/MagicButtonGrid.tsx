import { View, Text, Pressable } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { Lock } from "lucide-react-native"
import { MAGIC_BUTTONS, type MagicButtonSlug, type Plan, isAccessible } from "@/lib/magic-buttons"
import { colors } from "@/lib/theme"

interface Props {
  plan?: Plan
  onPick: (slug: MagicButtonSlug) => void
  /** Optional cap to render (e.g. 4 on Today screen). */
  limit?: number
}

export function MagicButtonGrid({ plan = "free", onPick, limit }: Props) {
  const buttons = limit ? MAGIC_BUTTONS.slice(0, limit) : MAGIC_BUTTONS

  return (
    <View className="flex-row flex-wrap -m-1.5">
      {buttons.map((b) => {
        const accessible = isAccessible(b, plan)
        return (
          <View key={b.slug} className="w-1/2 p-1.5">
            <Pressable
              testID={`magic-${b.slug}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                onPick(b.slug)
              }}
              accessibilityRole="button"
              accessibilityLabel={b.name}
              className="overflow-hidden rounded-2xl border border-border"
            >
              <LinearGradient
                colors={b.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 14, minHeight: 116 }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="size-9 rounded-full bg-bg/60 items-center justify-center">
                    <b.Icon size={16} color={colors.ivory} strokeWidth={1.6} />
                  </View>
                  {!accessible ? (
                    <Lock size={12} color={colors.muted} strokeWidth={1.6} />
                  ) : null}
                </View>
                <Text
                  className="text-ivory text-[15px] font-semibold mt-3"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {b.name}
                </Text>
                <Text className="text-muted text-[11px] mt-0.5" numberOfLines={1}>
                  {b.durationLabel}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        )
      })}
    </View>
  )
}
