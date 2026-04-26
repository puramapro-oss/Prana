"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, Mail, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"

export function SignupForm() {
  const searchParams = useSearchParams()
  const ref = searchParams.get("ref")
  const next = searchParams.get("next") ?? "/today"
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState<"email" | "google" | null>(null)
  const [sent, setSent] = useState(false)

  const callbackUrl = (origin: string) =>
    `${origin}/auth/callback?next=${encodeURIComponent(next)}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}`

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading("email")
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl(window.location.origin),
        data: { ref: ref ?? undefined, locale: "fr" },
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
      options: { redirectTo: callbackUrl(window.location.origin) },
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
          <CardTitle className="text-2xl">Bienvenue. Vérifie tes mails.</CardTitle>
          <CardDescription>
            Lien de connexion envoyé à <strong className="text-foreground">{email}</strong>.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-1">
          <Sparkles className="size-3.5" strokeWidth={1.8} />
          7 jours Pro offerts, sans carte
        </div>
        <CardTitle className="text-2xl font-heading">Tu vas respirer.</CardTitle>
        <CardDescription>C&apos;est tout. On commence par là.</CardDescription>
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
            <span className="size-4 inline-block bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><path fill=%22%234285F4%22 d=%22M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z%22/></svg>')] bg-no-repeat" />
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
            Créer mon espace
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 items-center">
        <p className="text-sm text-muted-foreground">
          Déjà inscrit·e ?{" "}
          <Link href="/login" className="text-foreground hover:text-primary underline underline-offset-2">
            Se connecter
          </Link>
        </p>
        <p className="text-xs text-muted-foreground/70 text-center">
          En continuant, tu acceptes nos{" "}
          <Link href="/cgu" className="underline underline-offset-2">
            CGU
          </Link>{" "}
          et notre{" "}
          <Link href="/confidentialite" className="underline underline-offset-2">
            politique de confidentialité
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  )
}
