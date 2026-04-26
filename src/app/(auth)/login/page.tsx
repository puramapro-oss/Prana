import { Suspense } from "react"
import { LoginForm } from "./login-form"

export const metadata = {
  title: "Connexion",
  description: "Connecte-toi à PURAMA ONE — calme, organise, exécute.",
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
