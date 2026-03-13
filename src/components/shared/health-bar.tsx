import { cn } from "@/lib/utils"

interface HealthBarProps {
  percentage: number
  total: number
  done: number
  blocked?: number
  className?: string
}

export function HealthBar({ percentage, total, done, blocked = 0, className }: HealthBarProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{done}/{total} done</span>
        {blocked > 0 && <span className="text-red-500">{blocked} blocked</span>}
        <span>{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
