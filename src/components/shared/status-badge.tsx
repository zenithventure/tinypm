import { Badge } from "@/components/ui/badge"
import type { BadgeVariant } from "@/components/ui/badge"
import { STATUS_LABELS } from "@/lib/constants"

const statusVariants: Record<string, BadgeVariant> = {
  todo: "neutral",
  planned: "neutral",
  "in-progress": "info",
  "in-review": "purple",
  done: "success",
  blocked: "danger",
  cancelled: "neutral",
  parked: "warning",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariants[status] || "neutral"}>
      {STATUS_LABELS[status] || status}
    </Badge>
  )
}
