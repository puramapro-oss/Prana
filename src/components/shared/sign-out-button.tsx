"use client"

import { useState } from "react"
import { LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function SignOutButton() {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    // Clear any client-side state then hard redirect to /login
    if (typeof window !== "undefined") {
      try {
        Object.keys(window.localStorage).forEach((k) => {
          if (k.startsWith("sb-") || k.startsWith("prana_")) window.localStorage.removeItem(k)
        })
      } catch {
        /* ignore */
      }
      window.location.href = "/login"
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      <span className="hidden sm:inline">Déconnexion</span>
    </Button>
  )
}
