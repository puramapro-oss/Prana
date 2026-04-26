import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { findProtocol } from "@/lib/regulate/protocols"
import { ProtocolPlayer } from "@/components/regulate/protocol-player"

export async function generateMetadata({ params }: { params: Promise<{ protocol: string }> }) {
  const { protocol: slug } = await params
  const p = findProtocol(slug)
  if (!p) return { title: "Protocole introuvable" }
  return {
    title: `${p.name_fr} · Régulation`,
    description: p.description_fr,
  }
}

export default async function ProtocolPage({
  params,
}: {
  params: Promise<{ protocol: string }>
}) {
  const { protocol: slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const protocol = findProtocol(slug)
  if (!protocol) notFound()

  return (
    <div className="container-calm py-6 sm:py-8 max-w-2xl space-y-5">
      <Link
        href="/regulate"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" strokeWidth={1.8} />
        Tous les protocoles
      </Link>
      <ProtocolPlayer protocol={protocol} />
    </div>
  )
}
