import { Bug, Lightbulb, MessageSquare, TrendingUp, Wrench } from "lucide-react"
import { TYPE_LABELS } from "@/lib/constants"

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  feature: Lightbulb,
  bug: Bug,
  decision: MessageSquare,
  "sales-insight": TrendingUp,
  "ops-task": Wrench,
}

export function TypeIcon({ type, className }: { type: string; className?: string }) {
  const Icon = typeIcons[type] || Wrench
  return <Icon className={className || "w-4 h-4"} />
}

export function TypeLabel({ type }: { type: string }) {
  return <span>{TYPE_LABELS[type] || type}</span>
}
