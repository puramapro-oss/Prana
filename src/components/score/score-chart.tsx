"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts"
import type { DailyScore } from "@/lib/supabase/types"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

interface BaseProps {
  series: DailyScore[]
}

const tickFmt = (iso: string) => format(parseISO(iso), "d MMM", { locale: fr })

interface TooltipPayload {
  active?: boolean
  payload?: Array<{ value?: number | null; name?: string }>
  label?: string
}

function FmtTooltip({ active, payload, label, suffix = "" }: TooltipPayload & { suffix?: string }) {
  if (!active || !payload || !payload.length) return null
  const v = payload[0]?.value
  if (v === null || v === undefined) return null
  return (
    <div className="rounded-md border bg-background/95 backdrop-blur px-3 py-2 text-xs shadow-sm">
      <p className="font-medium">{label && format(parseISO(label), "EEEE d MMMM", { locale: fr })}</p>
      <p className="text-muted-foreground mt-0.5">
        {payload[0]?.name} : <span className="text-foreground font-semibold">{Number(v).toFixed(1)}{suffix}</span>
      </p>
    </div>
  )
}

export function StressEnergyChart({ series }: BaseProps) {
  const data = series.map((d) => ({
    date: d.date,
    Stress: d.stress_avg,
    Énergie: d.energy_avg,
  }))
  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Stress & énergie</CardTitle>
        <CardDescription>Moyenne quotidienne · {series.length} jours</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
              <XAxis
                dataKey="date"
                tickFormatter={tickFmt}
                fontSize={10}
                stroke="currentColor"
                strokeOpacity={0.4}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis domain={[0, 10]} fontSize={10} stroke="currentColor" strokeOpacity={0.4} tickLine={false} axisLine={false} width={28} />
              <Tooltip content={<FmtTooltip suffix="/10" />} />
              <Line type="monotone" dataKey="Stress" stroke="hsl(0 70% 60%)" strokeWidth={1.6} dot={false} connectNulls />
              <Line type="monotone" dataKey="Énergie" stroke="hsl(160 60% 45%)" strokeWidth={1.6} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function SleepChart({ series }: BaseProps) {
  const data = series.map((d) => ({ date: d.date, Sommeil: d.sleep_quality }))
  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Sommeil</CardTitle>
        <CardDescription>Auto-déclaré · 0–10</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
              <XAxis dataKey="date" tickFormatter={tickFmt} fontSize={10} stroke="currentColor" strokeOpacity={0.4} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0, 10]} fontSize={10} stroke="currentColor" strokeOpacity={0.4} tickLine={false} axisLine={false} width={28} />
              <Tooltip content={<FmtTooltip suffix="/10" />} />
              <Line type="monotone" dataKey="Sommeil" stroke="hsl(220 60% 60%)" strokeWidth={1.6} dot connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function FocusChart({ series }: BaseProps) {
  const data = series.map((d) => ({ date: d.date, Focus: d.focus_minutes }))
  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Focus</CardTitle>
        <CardDescription>Minutes en protocole · jour</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
              <XAxis dataKey="date" tickFormatter={tickFmt} fontSize={10} stroke="currentColor" strokeOpacity={0.4} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis fontSize={10} stroke="currentColor" strokeOpacity={0.4} tickLine={false} axisLine={false} width={28} />
              <Tooltip content={<FmtTooltip suffix=" min" />} />
              <Bar dataKey="Focus" fill="hsl(280 50% 60%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function AvancementChart({ series }: BaseProps) {
  const data = series.map((d) => ({ date: d.date, Actions: d.micro_actions_done + (d.one_action_done ? 1 : 0) }))
  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Avancement</CardTitle>
        <CardDescription>Actions terminées · jour</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
              <XAxis dataKey="date" tickFormatter={tickFmt} fontSize={10} stroke="currentColor" strokeOpacity={0.4} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis fontSize={10} stroke="currentColor" strokeOpacity={0.4} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <Tooltip content={<FmtTooltip />} />
              <Bar dataKey="Actions" fill="hsl(40 80% 55%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
