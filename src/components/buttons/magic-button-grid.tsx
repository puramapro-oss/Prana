"use client"

import { useState } from "react"
import { MAGIC_BUTTONS, isMagicButtonAccessible, type MagicButtonConfig } from "@/lib/agent/magic-buttons-config"
import { MagicButton } from "./magic-button"
import { MagicButtonModal } from "./magic-button-modal"
import type { Plan } from "@/lib/supabase/types"

interface MagicButtonGridProps {
  plan: Plan
}

export function MagicButtonGrid({ plan }: MagicButtonGridProps) {
  const [active, setActive] = useState<MagicButtonConfig | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {MAGIC_BUTTONS.map((button) => {
          const locked = !isMagicButtonAccessible(button, plan)
          return (
            <MagicButton
              key={button.slug}
              button={button}
              locked={locked}
              onClick={() => setActive(button)}
            />
          )
        })}
      </div>

      {active ? (
        <MagicButtonModal
          button={active}
          locked={!isMagicButtonAccessible(active, plan)}
          open={!!active}
          onOpenChange={(o) => {
            if (!o) setActive(null)
          }}
        />
      ) : null}
    </>
  )
}
