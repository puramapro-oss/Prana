import { Suspense } from "react"
import { SignupForm } from "./signup-form"

export const metadata = {
  title: "Créer un compte",
  description: "Commence à respirer. 7 jours Pro offerts, sans carte.",
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}
