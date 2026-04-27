"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"
import { useRoomMessages, usePostRoomMessage } from "@/hooks/use-rooms"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

interface RoomMessagesProps {
  slug: string
  isMember: boolean
  currentUserId: string
}

export function RoomMessages({ slug, isMember, currentUserId }: RoomMessagesProps) {
  const messages = useRoomMessages(slug)
  const post = usePostRoomMessage()
  const [draft, setDraft] = useState("")
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (messages.data?.messages.length && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages.data?.messages.length])

  if (!isMember) {
    return (
      <Card className="glass">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Rejoins la room pour voir le fil et écrire.
        </CardContent>
      </Card>
    )
  }

  const items = messages.data?.messages ?? []

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Fil de la room</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          ref={scrollRef}
          className="max-h-[420px] overflow-y-auto space-y-3 pr-1 -mr-1"
        >
          {messages.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-2/3 ml-auto" />
              <Skeleton className="h-12 w-3/4" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Pas encore de message. L&apos;host IA parlera demain matin. Tu peux écrire le premier mot.
            </p>
          ) : (
            items.map((m) => {
              const mine = m.user_id === currentUserId
              return (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-2xl px-3 py-2 max-w-[85%] text-sm leading-relaxed",
                    m.is_ai_host
                      ? "glass border border-primary/30 mr-auto"
                      : mine
                        ? "bg-primary/15 ml-auto"
                        : "bg-muted mr-auto",
                  )}
                >
                  {m.is_ai_host && (
                    <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary mb-1">
                      <Sparkles className="size-3" strokeWidth={1.8} />
                      Host
                      {m.day_number ? ` · jour ${m.day_number}` : ""}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {format(parseISO(m.created_at), "EEE d MMM HH:mm", { locale: fr })}
                  </p>
                </div>
              )
            })
          )}
        </div>

        <div className="space-y-2 pt-3 border-t border-border/40">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Écris ce que tu veux partager…"
            maxLength={1000}
            className="min-h-[72px] text-sm"
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground">{draft.length} / 1000</span>
            <Button
              size="sm"
              disabled={post.isPending || draft.trim().length < 2}
              onClick={() =>
                post.mutate(
                  { slug, body: draft.trim() },
                  {
                    onSuccess: () => {
                      setDraft("")
                    },
                    onError: (e) => toast.error(e.message),
                  },
                )
              }
            >
              {post.isPending ? "Envoi…" : "Envoyer"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
