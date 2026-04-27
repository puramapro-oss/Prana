import { useEffect, useState } from "react"
import { View, Text, ScrollView, Modal, Pressable, TextInput, KeyboardAvoidingView, Platform, Share } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import * as Clipboard from "expo-clipboard"
import { X, Copy, Share2 } from "lucide-react-native"
import { Button } from "./Button"
import { GlassCard } from "./GlassCard"
import { apiFetch, ApiError } from "@/lib/api"
import { findMagicButton, type MagicButtonSlug } from "@/lib/magic-buttons"
import { colors } from "@/lib/theme"

interface MagicResponse {
  protocol: { id: string; title: string; steps: Array<{ kind: string; text: string; durationSec?: number }> }
  pointsGranted?: number
  fallback?: boolean
}

interface Props {
  slug: MagicButtonSlug | null
  onClose: () => void
}

export function MagicButtonModal({ slug, onClose }: Props) {
  const [context, setContext] = useState("")
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<MagicResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cfg = slug ? findMagicButton(slug) : null

  useEffect(() => {
    if (slug) {
      setContext("")
      setResult(null)
      setError(null)
    }
  }, [slug])

  const submit = async () => {
    if (!slug) return
    setPending(true)
    setError(null)
    try {
      const data = await apiFetch<MagicResponse>("/api/agent/magic-button", {
        method: "POST",
        body: { slug, userContext: context.trim() || undefined },
        timeoutMs: 20_000,
      })
      setResult(data)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 402
          ? "Plan requis pour ce bouton — passe Pro pour débloquer."
          : err instanceof ApiError && err.status === 429
            ? "Quota du jour atteint. Reviens demain."
            : err instanceof Error
              ? err.message
              : "Erreur — réessaie."
      setError(msg)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
    } finally {
      setPending(false)
    }
  }

  const copyResult = async () => {
    if (!result) return
    const text = formatProtocol(result)
    await Clipboard.setStringAsync(text)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
  }

  const shareResult = async () => {
    if (!result) return
    const text = formatProtocol(result)
    await Share.share({ message: text }).catch(() => {})
  }

  return (
    <Modal
      visible={slug !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
            <View className="flex-1">
              {cfg ? (
                <>
                  <Text className="text-primary text-xs uppercase tracking-wider">
                    {cfg.durationLabel}
                  </Text>
                  <Text className="text-ivory text-xl font-heading">{cfg.name}</Text>
                </>
              ) : null}
            </View>
            <Pressable
              testID="magic-modal-close"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              className="size-10 items-center justify-center"
            >
              <X size={22} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
            {!result ? (
              <>
                {cfg ? (
                  <Text className="text-muted text-[15px] mb-4 leading-relaxed">{cfg.description}</Text>
                ) : null}
                <Text className="text-muted text-xs uppercase tracking-wider mb-2">Contexte (optionnel)</Text>
                <TextInput
                  testID="magic-context"
                  value={context}
                  onChangeText={setContext}
                  multiline
                  placeholder="Une phrase pour personnaliser, si tu veux."
                  placeholderTextColor={colors.muted}
                  className="min-h-[96px] p-4 rounded-lg bg-surface border border-border text-ivory"
                  textAlignVertical="top"
                  editable={!pending}
                />
                {error ? (
                  <View className="bg-danger/10 border border-danger/40 rounded-lg p-3 mt-3">
                    <Text className="text-danger text-sm">{error}</Text>
                  </View>
                ) : null}
                <View className="mt-5">
                  <Button testID="magic-submit" onPress={submit} loading={pending} size="md">
                    Lancer
                  </Button>
                </View>
              </>
            ) : (
              <>
                <Text className="text-ivory text-lg font-heading mb-3">{result.protocol.title}</Text>
                <View className="gap-3">
                  {result.protocol.steps.map((step, i) => (
                    <GlassCard key={i} className="p-4">
                      <Text className="text-muted text-xs uppercase tracking-wider mb-1">
                        Étape {i + 1}
                        {step.durationSec ? ` · ${step.durationSec}s` : ""}
                      </Text>
                      <Text className="text-ivory text-[15px] leading-relaxed">{step.text}</Text>
                    </GlassCard>
                  ))}
                </View>

                {result.fallback ? (
                  <Text className="text-muted text-xs mt-4 text-center">
                    Mode hors-ligne : protocole générique. Réessaie avec connexion pour l&apos;IA personnalisée.
                  </Text>
                ) : null}

                {typeof result.pointsGranted === "number" && result.pointsGranted > 0 ? (
                  <Text className="text-primary text-xs mt-3 text-center">
                    +{result.pointsGranted} points
                  </Text>
                ) : null}

                <View className="flex-row gap-3 mt-6">
                  <View className="flex-1">
                    <Button onPress={copyResult} variant="secondary">
                      <Copy size={14} color={colors.ivory} strokeWidth={1.6} /> Copier
                    </Button>
                  </View>
                  <View className="flex-1">
                    <Button onPress={shareResult} variant="secondary">
                      <Share2 size={14} color={colors.ivory} strokeWidth={1.6} /> Partager
                    </Button>
                  </View>
                </View>

                <View className="mt-3">
                  <Button onPress={onClose}>Fermer</Button>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

function formatProtocol(r: MagicResponse): string {
  const lines = [r.protocol.title, ""]
  r.protocol.steps.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.text}${s.durationSec ? ` (${s.durationSec}s)` : ""}`)
  })
  lines.push("", "— PURAMA ONE")
  return lines.join("\n")
}
