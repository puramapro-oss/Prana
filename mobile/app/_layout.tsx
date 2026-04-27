import "../global.css"
import { useEffect } from "react"
import { Stack, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import * as Linking from "expo-linking"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { colors } from "@/lib/theme"

const E2E_ENABLED = process.env.EXPO_PUBLIC_E2E_BYPASS === "1"

async function handleE2ESession(query: Record<string, string | undefined>): Promise<boolean> {
  if (!E2E_ENABLED) return false
  const token = query.token
  if (!token) return false
  // Token may be tab-separated access_token<TAB>refresh_token, mint script output.
  const [access, refresh] = token.split("\t")
  if (!access || !refresh) return false
  const { error } = await supabase.auth.setSession({ access_token: access, refresh_token: refresh })
  return !error
}

function handleDeepLink(url: string, router: ReturnType<typeof useRouter>): boolean {
  try {
    const parsed = Linking.parse(url)
    const path = parsed.path ?? ""
    if (!path) return false
    const segs = path.split("/")
    const head = segs[0]
    if (head === "e2e" && segs[1] === "session") {
      // Fire-and-forget: setSession resolves asynchronously, AuthGate redirects on session change.
      void handleE2ESession((parsed.queryParams as Record<string, string | undefined>) ?? {})
      return true
    }
    switch (head) {
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
