"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useJoinRoom, useLeaveRoom } from "@/hooks/use-rooms"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

interface RoomJoinButtonProps {
  slug: string
  isMember: boolean
  durationDays: number
}

export function RoomJoinButton({ slug, isMember, durationDays }: RoomJoinButtonProps) {
  const router = useRouter()
  const [, start] = useTransition()
  const join = useJoinRoom()
  const leave = useLeaveRoom()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (isMember) {
    return (
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger
          render={
            <Button variant="outline" size="sm">
              <LogOut className="size-4" />
              Quitter la room
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quitter la room ?</DialogTitle>
            <DialogDescription>
              Tu garderas tes messages. Ta progression actuelle sera perdue. Tu pourras rejoindre à
              nouveau quand tu veux — tu repartiras du jour 1.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={leave.isPending}
              onClick={() =>
                leave.mutate(
                  { slug },
                  {
                    onSuccess: () => {
                      setConfirmOpen(false)
                      toast.success("Tu es sorti·e de la room.")
                      start(() => router.refresh())
                    },
                    onError: (e) => toast.error(e.message),
                  },
                )
              }
            >
              {leave.isPending ? "Sortie…" : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Button
      size="sm"
      disabled={join.isPending}
      onClick={() =>
        join.mutate(
          { slug },
          {
            onSuccess: () => {
              toast.success(`Embarqué·e pour ${durationDays} jours.`)
              start(() => router.refresh())
            },
            onError: (e) => toast.error(e.message),
          },
        )
      }
    >
      <Sparkles className="size-4" />
      {join.isPending ? "…" : "Rejoindre"}
    </Button>
  )
}
