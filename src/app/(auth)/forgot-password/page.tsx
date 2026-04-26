import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Mot de passe oublié",
  description: "Récupère l'accès à ton espace.",
}

export default function ForgotPasswordPage() {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-2xl font-heading">Pas besoin de mot de passe.</CardTitle>
        <CardDescription>
          On utilise un lien magique envoyé par mail. Pas de mot de passe à perdre, pas de mot de passe à voler.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full" size="lg">
          <Link href="/login">Recevoir un lien magique</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
