import { View, Text, ScrollView, Pressable, Alert, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ChevronRight, LogOut, Globe, Heart, Shield, FileText, ExternalLink } from "lucide-react-native"
import { GlassCard } from "@/components/GlassCard"
import { Button } from "@/components/Button"
import { useAuth, signOut } from "@/hooks/useAuth"
import { APP_BASE_URL } from "@/lib/supabase"
import { colors } from "@/lib/theme"

export default function SettingsScreen() {
  const { user } = useAuth()

  const openWeb = (path: string) => Linking.openURL(`${APP_BASE_URL}${path}`)

  const onLogout = () => {
    Alert.alert("Se déconnecter ?", "Tu pourras te reconnecter avec ton email.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await signOut()
        },
      },
    ])
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <Text className="text-primary text-xs uppercase tracking-wider mb-2">Réglages</Text>
        <Text className="text-ivory text-3xl font-heading mb-6">Ton espace</Text>

        <GlassCard className="p-5 mb-4">
          <Text className="text-muted text-xs uppercase tracking-wider mb-1">Connecté en tant que</Text>
          <Text className="text-ivory text-base">{user?.email ?? "—"}</Text>
        </GlassCard>

        <View className="gap-2 mb-4">
          <Row testID="row-billing" Icon={Heart} label="Abonnement" onPress={() => openWeb("/settings/billing")} external />
          <Row testID="row-safety" Icon={Shield} label="Sécurité & contacts d'urgence" onPress={() => openWeb("/settings/safety")} external />
          <Row testID="row-notifs" Icon={Globe} label="Notifications & langue" onPress={() => openWeb("/settings/notifications")} external />
          <Row testID="row-data" Icon={FileText} label="Mes données (export · suppression)" onPress={() => openWeb("/settings/data")} external />
        </View>

        <Button testID="logout" onPress={onLogout} variant="secondary">
          <LogOut size={16} color={colors.ivory} strokeWidth={1.6} />
          {"  "}Se déconnecter
        </Button>

        <Text className="text-muted text-xs text-center mt-8">
          PURAMA · 8 Rue de la Chapelle, 25560 Frasne, France
        </Text>
        <Text className="text-muted text-xs text-center mt-1">v1.0.0 · build 1</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function Row({
  Icon,
  label,
  onPress,
  external,
  testID,
}: {
  Icon: typeof Heart
  label: string
  onPress: () => void
  external?: boolean
  testID?: string
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <GlassCard className="p-4">
        <View className="flex-row items-center gap-3">
          <Icon size={18} color={colors.muted} strokeWidth={1.6} />
          <Text className="text-ivory flex-1">{label}</Text>
          {external ? (
            <ExternalLink size={16} color={colors.muted} strokeWidth={1.6} />
          ) : (
            <ChevronRight size={16} color={colors.muted} />
          )}
        </View>
      </GlassCard>
    </Pressable>
  )
}
