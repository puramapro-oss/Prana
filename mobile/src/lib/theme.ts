/**
 * PRANA mobile design tokens — mirrors web tailwind.config.ts.
 * Use these via NativeWind classes; this object is for non-NW contexts
 * (StatusBar, Stack screen options, native modules).
 */
export const colors = {
  bg: "#0A0A0F",
  bgDeep: "#070708",
  surface: "#13131A",
  surfaceElevated: "#1B1B23",
  primary: "#F472B6",
  primaryDeep: "#DB2777",
  accent: "#7C3AED",
  accentDeep: "#5B21B6",
  ivory: "#FBFAF7",
  muted: "#6B6B72",
  border: "rgba(255,255,255,0.08)",
  borderHi: "rgba(255,255,255,0.14)",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
} as const

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const
