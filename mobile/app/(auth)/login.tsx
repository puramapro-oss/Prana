import { useState } from "react"
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import { Wind } from "lucide-react-native"
import { Button } from "@/components/Button"
import { supabase, APP_BASE_URL } from "@/lib/supabase"
import { colors } from "@/lib/theme"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  const sendMagicLink = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Email invalide", "Entre un email valide pour recevoir le lien.")
      return
    }
    setPending(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${APP_BASE_URL}/auth/callback` },
    })
    setPending(false)
    if (error) {
      Alert.alert("Erreur", error.message)
      return
    }
    setSent(true)
  }

  const signInGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${APP_BASE_URL}/auth/callback?next=prana://today`,
        skipBrowserRedirect: true,
      },
    })
    if (error || !data.url) {
      Alert.alert("Erreur", error?.message ?? "Connexion impossible.")
      return
    }
    await WebBrowser.openAuthSessionAsync(data.url, "prana://today")
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" testID="login-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center gap-8">
          <View className="items-center gap-3">
            <Wind size={32} color={colors.primary} strokeWidth={1.6} />
            <Text className="text-ivory text-2xl font-heading">Bon retour.</Text>
            <Text className="text-muted text-center text-[15px]">
              Reçois un lien magique par email ou continue avec Google.
            </Text>
          </View>

          {sent ? (
            <View className="bg-surface border border-border rounded-2xl p-5 items-center gap-2">
              <Text className="text-ivory font-semibold">Lien envoyé.</Text>
              <Text className="text-muted text-center text-sm">
                Regarde ta boîte mail et clique sur le lien pour te connecter.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              <TextInput
                testID="login-email"
                value={email}
                onChangeText={setEmail}
                placeholder="toi@exemple.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="h-12 px-4 rounded-lg bg-surface border border-border text-ivory"
              />
              <Button
                testID="login-magic-link"
                onPress={sendMagicLink}
                loading={pending}
                size="md"
              >
                Recevoir un lien magique
              </Button>
              <View className="flex-row items-center gap-3 my-1">
                <View className="flex-1 h-px bg-border" />
                <Text className="text-muted text-xs uppercase">ou</Text>
                <View className="flex-1 h-px bg-border" />
              </View>
              <Button
                testID="login-google"
                onPress={signInGoogle}
                variant="secondary"
                size="md"
              >
                Continuer avec Google
              </Button>
            </View>
          )}

          <View className="items-center">
            <Link href="/(auth)/signup" asChild>
              <Text className="text-muted text-sm">
                Pas encore de compte ? <Text className="text-ivory">Créer un compte</Text>
              </Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
