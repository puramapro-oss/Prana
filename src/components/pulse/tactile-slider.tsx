"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

interface TactileSliderProps {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Tailwind classes applied to the indicator (range filled). */
  rangeClassName?: string
  ariaLabel: string
  disabled?: boolean
}

/**
 * Big finger-friendly slider for Pulse Check.
 * 56px thumb, 8px track, soft spring feel via reduced animation duration.
 */
export function TactileSlider({
  value,
  onValueChange,
  min = 0,
  max = 10,
  step = 1,
  rangeClassName,
  ariaLabel,
  disabled,
}: TactileSliderProps) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      onValueChange={(v) => {
        const next = Array.isArray(v) ? v[0] : v
        if (typeof next === "number") onValueChange(next)
      }}
      min={min}
      max={max}
      step={step}
      thumbAlignment="edge"
      disabled={disabled}
      aria-label={ariaLabel}
      className="w-full"
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none py-3 data-disabled:opacity-50">
        <SliderPrimitive.Track className="relative grow overflow-hidden rounded-full bg-muted/80 h-2 w-full">
          <SliderPrimitive.Indicator
            className={cn(
              "h-full select-none transition-[width] duration-200",
              rangeClassName ?? "bg-primary",
            )}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "relative block size-7 sm:size-8 shrink-0 rounded-full border border-border/60 bg-card shadow-md ring-ring/30 select-none",
            "after:absolute after:-inset-3 after:content-['']", // bigger touch target
            "transition-[transform,box-shadow] duration-150 active:scale-105 active:shadow-lg",
            "hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}
