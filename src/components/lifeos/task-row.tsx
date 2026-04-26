"use client"

import { Check, MoreHorizontal, Trash2, Clock, Battery, BatteryLow, BatteryFull } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteTask, useUpdateTaskStatus } from "@/hooks/use-lifeos"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/supabase/types"

interface TaskRowProps {
  task: Task
  projectName?: string
  personName?: string
}

const PRIORITY_COLOR: Record<number, string> = {
  1: "bg-red-500/15 text-red-200 border-red-500/30",
  2: "bg-orange-500/15 text-orange-200 border-orange-500/30",
  3: "bg-muted/40 text-muted-foreground border-border/50",
  4: "bg-muted/30 text-muted-foreground/80 border-border/40",
  5: "bg-muted/20 text-muted-foreground/60 border-border/30",
}

const PRIORITY_LABEL: Record<number, string> = {
  1: "P1",
  2: "P2",
  3: "P3",
  4: "P4",
  5: "P5",
}

export function TaskRow({ task, projectName, personName }: TaskRowProps) {
  const [busy, setBusy] = useState(false)
  const updateStatus = useUpdateTaskStatus()
  const remove = useDeleteTask()

  const done = task.status === "done"

  async function toggleDone() {
    if (busy) return
    setBusy(true)
    try {
      await updateStatus.mutateAsync({
        id: task.id,
        status: done ? "todo" : "done",
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (busy) return
    setBusy(true)
    try {
      await remove.mutateAsync(task.id)
    } finally {
      setBusy(false)
    }
  }

  const energyIcon =
    task.energy_required === "high" ? (
      <BatteryFull className="size-3.5" />
    ) : task.energy_required === "low" ? (
      <BatteryLow className="size-3.5" />
    ) : task.energy_required === "medium" ? (
      <Battery className="size-3.5" />
    ) : null

  return (
    <li
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-border/50 bg-card/60 px-3 py-3 sm:px-4",
        "transition hover:border-border",
        done && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={toggleDone}
        disabled={busy}
        aria-label={done ? "Marquer comme à faire" : "Marquer comme fait"}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition",
          done
            ? "bg-primary border-primary text-primary-foreground"
            : "border-border/70 hover:border-primary/70",
        )}
      >
        {done ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-mono tracking-wider",
              PRIORITY_COLOR[task.priority] ?? PRIORITY_COLOR[3],
            )}
          >
            {PRIORITY_LABEL[task.priority] ?? "P3"}
          </span>
          <p
            className={cn(
              "text-sm leading-snug break-words",
              done && "line-through",
            )}
          >
            {task.title}
          </p>
        </div>
        {task.description ? (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
            {task.description}
          </p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {task.time_estimate_minutes ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {task.time_estimate_minutes} min
            </span>
          ) : null}
          {energyIcon ? (
            <span className="inline-flex items-center gap-1 capitalize">
              {energyIcon}
              {task.energy_required}
            </span>
          ) : null}
          {projectName ? (
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-primary/60" />
              {projectName}
            </span>
          ) : null}
          {personName ? (
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-amber-400/70" />
              {personName}
            </span>
          ) : null}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          nativeButton={true}
          className="size-7 rounded-md text-muted-foreground hover:bg-muted/40 hover:text-foreground transition opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Options"
        >
          <MoreHorizontal className="mx-auto size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!done ? (
            <DropdownMenuItem
              onClick={() => updateStatus.mutate({ id: task.id, status: "doing" })}
            >
              Marquer en cours
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onClick={() => updateStatus.mutate({ id: task.id, status: "dropped" })}
          >
            Abandonner
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="size-4 mr-2" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
