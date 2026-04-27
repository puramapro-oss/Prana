import "../global.css"
import { useEffect } from "react"
import { Stack, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import * as Linking from "expo-linking"
import { useAuth } from "@/hooks/useAuth"
import { colors } from "@/lib/theme"

function handleDeepLink(url: string, router: ReturnType<typeof useRouter>): boolean {
  try {
    const parsed = Linking.parse(url)
    const path = parsed.path ?? ""
    if (!path) return false
    const seg = path.split("/")[0]
    switch (seg) {
      case "today":
        router.replace("/(tabs)/today")
        return true
      case "regulate":
        router.replace("/(tabs)/regulate")
        return true
      case "score":
        router.replace("/(tabs)/score")
        return true
      case "settings":
        router.replace("/(tabs)/settings")
        return true
      case "activate":
        router.replace("/(tabs)/today")
        return true
      default:
        return false
    }
  } catch {
    return false
  }
}

function DeepLinkListener() {
  const router = useRouter()
  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url, router)
    })
    const sub = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url, router)
    })
    return () => sub.remove()
  }, [router])
  return null
}

function AuthGate() {
  const { session, loading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    const inAuth = segments[0] === "(auth)"
    const inTabs = segments[0] === "(tabs)"
    if (!session && !inAuth) router.replace("/(auth)/login")
    else if (session && !inTabs) router.replace("/(tabs)/today")
  }, [session, loading, segments, router])

  return null
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthGate />
        <DeepLinkListener />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: "fade",
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
