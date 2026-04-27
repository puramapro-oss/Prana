import { Pressable, Text, ActivityIndicator, View } from "react-native"
import * as Haptics from "expo-haptics"
import type { ReactNode } from "react"

type Variant = "primary" | "secondary" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-ivory active:opacity-80",
  secondary: "bg-surface border border-border active:bg-surfaceElevated",
  ghost: "active:bg-surface",
  danger: "bg-danger active:opacity-80",
}

const VARIANT_TEXT: Record<Variant, string> = {
  primary: "text-bg",
  secondary: "text-ivory",
  ghost: "text-ivory",
  danger: "text-ivory",
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-10 px-3 rounded-md",
  md: "h-12 px-5 rounded-lg",
  lg: "h-14 px-6 rounded-xl",
}

const SIZE_TEXT: Record<Size, string> = {
  sm: "text-sm",
  md: "text-[15px]",
  lg: "text-base",
}

interface Props {
  onPress?: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  children: ReactNode
  haptic?: boolean
  testID?: string
  accessibilityLabel?: string
}

export function Button({
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  children,
  haptic = true,
  testID,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        if (disabled || loading) return
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        onPress?.()
      }}
      disabled={disabled || loading}
      className={`${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} flex-row items-center justify-center gap-2 ${
        disabled || loading ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "primary" ? "#0A0A0F" : "#FBFAF7"} />
      ) : (
        <View className="flex-row items-center gap-2">
          <Text className={`${VARIANT_TEXT[variant]} ${SIZE_TEXT[size]} font-semibold`}>{children}</Text>
        </View>
      )}
    </Pressable>
  )
}
