import { useCallback, useState } from "react"
import { supabase } from "@/lib/supabase"

export interface PulseCheckRow {
  id: string
  user_id: string
  stress_level: number
  energy_level: number
  notes: string | null
  created_at: string
}

interface PulseInput {
  stressLevel: number
  energyLevel: number
  notes?: string
}

export function useCreatePulse() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (input: PulseInput) => {
    setPending(true)
    setError(null)
    const { data: userRes } = await supabase.auth.getUser()
    const userId = userRes.user?.id
    if (!userId) {
      setPending(false)
      setError("not_authenticated")
      return null
    }
    const { data, error: insertError } = await supabase
      .from("pulse_checks")
      .insert({
        user_id: userId,
        stress_level: input.stressLevel,
        energy_level: input.energyLevel,
        notes: input.notes ?? null,
      })
      .select("id, user_id, stress_level, energy_level, notes, created_at")
      .single()

    setPending(false)
    if (insertError) {
      setError(insertError.message)
      return null
    }
    return data as PulseCheckRow
  }, [])

  return { submit, pending, error }
}

export async function fetchLastPulse(): Promise<PulseCheckRow | null> {
  const { data, error } = await supabase
    .from("pulse_checks")
    .select("id, user_id, stress_level, energy_level, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) return null
  return (data as PulseCheckRow | null) ?? null
}
