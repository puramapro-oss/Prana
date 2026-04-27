import { SettingsTabs } from "@/components/settings/settings-tabs"

export const metadata = {
  title: "Réglages · PURAMA ONE",
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="space-y-1.5 mb-4">
        <h1 className="font-heading text-3xl tracking-tight">Réglages</h1>
        <p className="text-sm text-muted-foreground">
          Profil, abonnement, sécurité, notifications, données.
        </p>
      </header>
      <SettingsTabs />
      {children}
    </div>
  )
}
