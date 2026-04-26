"use client"

import Link from "next/link"
import { Heart } from "lucide-react"

/**
 * PURAMA ONE — Safety Net.
 * Discret, toujours accessible. Bas-gauche pour ne pas concurrencer le CTA principal.
 * Hidden during active protocol via [data-protocol-active="true"] on body (set/cleared by ProtocolPlayer).
 */
export function SOSFloatingButton() {
  return (
    <Link
      href="/sos"
      className="fixed left-4 bottom-4 z-40 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-foreground/80 hover:text-foreground glass shadow-lg shadow-black/5 hover:shadow-primary/15 transition-all data-[protocol-active=true]:opacity-0 data-[protocol-active=true]:pointer-events-none"
      aria-label="Tu n'es pas seul·e — appel d'aide"
    >
      <Heart className="size-3.5 text-primary" strokeWidth={1.8} />
      <span>Tu n&apos;es pas seul·e</span>
    </Link>
  )
}
