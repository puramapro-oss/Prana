"use client"

import { useEffect } from "react"
import { Wind, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Errors are auto-captured by Sentry instrumentation (wired in P8).
    void error
  }, [error])

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 text-center">
      <Wind className="size-10 text-primary mb-6" strokeWidth={1.4} />
      <h1 className="font-heading text-5xl tracking-tight mb-3">Une vague est passée.</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        On respire, on réessaie. Si ça persiste, contacte-nous : matiss.frasne@gmail.com.
      </p>
      <Button onClick={reset} size="lg">
        <RefreshCw className="size-4" />
        Réessayer
      </Button>
    </div>
  )
}
