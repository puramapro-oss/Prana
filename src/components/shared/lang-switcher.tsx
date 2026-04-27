"use client"

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config"

export function LangSwitcher({
  align = "end",
  className = "",
}: {
  align?: "start" | "center" | "end"
  className?: string
}) {
  const current = useLocale() as Locale
  const t = useTranslations("LangSwitcher")
  const [isPending, startTransition] = useTransition()

  function setLocale(next: Locale) {
    if (next === current) return
    startTransition(async () => {
      await fetch("/api/i18n/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      })
      window.location.reload()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton={true}
        aria-label={t("label")}
        disabled={isPending}
        className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-50 ${className}`}
      >
        <Globe className="size-4" strokeWidth={1.6} />
        <span className="hidden sm:inline">{LOCALE_LABELS[current]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={loc === current ? "font-medium" : ""}
          >
            {t(loc)}
            {loc === current ? <span className="ml-auto text-muted-foreground">·</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
