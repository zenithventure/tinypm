import { Badge } from "@/components/ui/badge"
import type { BadgeVariant } from "@/components/ui/badge"
import { PRIORITY_LABELS } from "@/lib/constants"

const priorityVariants: Record<string, BadgeVariant> = {
  low: "neutral",
  medium: "info",
  high: "warning",
  critical: "danger",
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge variant={priorityVariants[priority] || "neutral"}>
      {PRIORITY_LABELS[priority] || priority}
    </Badge>
  )
}
