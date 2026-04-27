import { Tabs } from "expo-router"
import { Wind, Activity, BarChart3, Settings } from "lucide-react-native"
import { colors } from "@/lib/theme"

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.bgDeep,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Aujourd'hui",
          tabBarIcon: ({ color, size }) => <Wind color={color} size={size} strokeWidth={1.6} />,
        }}
      />
      <Tabs.Screen
        name="regulate"
        options={{
          title: "Réguler",
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} strokeWidth={1.6} />,
        }}
      />
      <Tabs.Screen
        name="score"
        options={{
          title: "Score",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} strokeWidth={1.6} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Réglages",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} strokeWidth={1.6} />,
        }}
      />
    </Tabs>
  )
}
