"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/today"
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState<"email" | "google" | null>(null)
  const [sent, setSent] = useState(false)

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading("email")
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    setLoading(null)
    if (error) {
      toast.error("Impossible d'envoyer le lien.", { description: error.message })
      return
    }
    setSent(true)
    toast.success("Lien envoyé. Vérifie ta boîte mail.")
  }

  async function handleGoogle() {
    setLoading("google")
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    if (error) {
      setLoading(null)
      toast.error("Connexion Google indisponible.", { description: error.message })
    }
  }

  if (sent) {
    return (
      <Card className="glass">
        <CardHeader>
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Mail className="size-5 text-primary" strokeWidth={1.6} />
          </div>
          <CardTitle className="text-2xl">Vérifie tes mails</CardTitle>
          <CardDescription>
            On t&apos;a envoyé un lien de connexion à <strong className="text-foreground">{email}</strong>. Clique
            dessus depuis cet appareil pour entrer.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="ghost" onClick={() => setSent(false)} className="text-sm">
            Mauvaise adresse ? Recommencer
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-2xl font-heading">Bon retour.</CardTitle>
        <CardDescription>Respire. On t&apos;attendait.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={handleGoogle}
          disabled={loading !== null}
        >
          {loading === "google" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleIcon className="size-4" />
          )}
          Continuer avec Google
        </Button>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-3 text-xs uppercase tracking-wider text-muted-foreground bg-background">
            ou
          </span>
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="toi@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading !== null}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading !== null || !email}>
            {loading === "email" ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            Recevoir un lien magique
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 items-center">
        <p className="text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-foreground hover:text-primary underline underline-offset-2">
            Créer un compte
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}
