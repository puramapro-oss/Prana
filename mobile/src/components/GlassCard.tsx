import { View, type ViewProps } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import type { ReactNode } from "react"

interface Props extends ViewProps {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className = "", style, ...rest }: Props) {
  return (
    <View
      {...rest}
      style={style}
      className={`rounded-2xl border border-border bg-surface overflow-hidden ${className}`}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="none"
      />
      <View>{children}</View>
    </View>
  )
}
