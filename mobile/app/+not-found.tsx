import { View, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link } from "expo-router"
import { Button } from "@/components/Button"

export default function NotFound() {
  return (
    <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6 gap-4">
      <Text className="text-ivory text-2xl font-heading">Page introuvable</Text>
      <Text className="text-muted text-center">
        Le chemin demandé n&apos;existe pas. Reviens à l&apos;accueil.
      </Text>
      <View className="mt-2">
        <Link href="/(tabs)/today" asChild>
          <Button>Aller à aujourd&apos;hui</Button>
        </Link>
      </View>
    </SafeAreaView>
  )
}
