import { useState } from "react"
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link } from "expo-router"
import { Wind } from "lucide-react-native"
import { Button } from "@/components/Button"
import { supabase, APP_BASE_URL } from "@/lib/supabase"
import { colors } from "@/lib/theme"

export default function SignupScreen() {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Email invalide", "Entre un email valide.")
      return
    }
    setPending(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${APP_BASE_URL}/auth/callback`,
      },
    })
    setPending(false)
    if (error) {
      Alert.alert("Erreur", error.message)
      return
    }
    setSent(true)
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" testID="signup-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center gap-8">
          <View className="items-center gap-3">
            <Wind size={32} color={colors.primary} strokeWidth={1.6} />
            <Text className="text-ivory text-2xl font-heading">Bienvenue.</Text>
            <Text className="text-muted text-center text-[15px]">
              7 jours Pro offerts. Sans carte bancaire.
            </Text>
          </View>

          {sent ? (
            <View className="bg-surface border border-border rounded-2xl p-5 items-center gap-2">
              <Text className="text-ivory font-semibold">Lien envoyé.</Text>
              <Text className="text-muted text-center text-sm">
                Regarde ta boîte mail et clique sur le lien pour activer ton compte.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              <TextInput
                testID="signup-email"
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
                testID="signup-submit"
                onPress={submit}
                loading={pending}
              >
                Recevoir un lien magique
              </Button>
              <Text className="text-muted text-xs text-center">
                En créant un compte, tu acceptes les CGU et la confidentialité.
              </Text>
            </View>
          )}

          <View className="items-center">
            <Link href="/(auth)/login" asChild>
              <Text className="text-muted text-sm">
                Déjà un compte ? <Text className="text-ivory">Se connecter</Text>
              </Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
