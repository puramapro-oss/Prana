import { View, Text, Pressable } from "react-native"
import * as Haptics from "expo-haptics"

interface Props {
  label: string
  value: number
  onChange: (n: number) => void
  testID?: string
  /** 1-5 scale; emojis from low → high. */
  emojis?: [string, string, string, string, string]
}

export function PulseSlider({
  label,
  value,
  onChange,
  testID,
  emojis = ["😣", "😟", "😐", "🙂", "😊"],
}: Props) {
  return (
    <View className="gap-3" testID={testID}>
      <Text className="text-muted text-sm">{label}</Text>
      <View className="flex-row gap-2 justify-between">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            testID={`${testID ?? "pulse"}-${n}`}
            accessibilityRole="button"
            accessibilityLabel={`${label} ${n} sur 5`}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {})
              onChange(n)
            }}
            className={`flex-1 h-14 items-center justify-center rounded-lg border ${
              value === n ? "bg-ivory border-ivory" : "bg-surface border-border"
            }`}
          >
            <Text className="text-2xl">{emojis[n - 1]}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}
