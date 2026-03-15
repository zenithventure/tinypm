"use client"

import { useDroppable } from "@dnd-kit/core"
import { KanbanCard, WorkItemCardData } from "./kanban-card"

const columnColors: Record<string, { header: string; bg: string; border: string; dot: string }> = {
  todo: {
    header: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
  "in-progress": {
    header: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  "in-review": {
    header: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  done: {
    header: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  blocked: {
    header: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  cancelled: {
    header: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-300",
  },
}

interface KanbanColumnProps {
  status: string
  label: string
  items: WorkItemCardData[]
  workspaceId: string
}

export function KanbanColumn({ status, label, items, workspaceId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const colors = columnColors[status] || columnColors["todo"]

  return (
    <div className="flex flex-col min-w-[260px] w-[260px] flex-shrink-0">
      {/* Column header */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg border ${colors.border} ${colors.bg}`}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
        <span className={`text-sm font-semibold flex-1 ${colors.header}`}>{label}</span>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.header} border ${colors.border}`}>
          {items.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-[200px] rounded-b-lg border-l border-r border-b p-2 space-y-2 transition-colors
          ${colors.border}
          ${isOver ? `${colors.bg} border-opacity-100` : "bg-white border-opacity-60"}
        `}
      >
        {items.length === 0 ? (
          <div
            className={`
              flex items-center justify-center h-16 rounded-md border-2 border-dashed
              ${isOver ? `${colors.border} ${colors.bg}` : "border-gray-200"}
              text-xs text-gray-400 transition-colors
            `}
          >
            {isOver ? "Drop here" : "No items"}
          </div>
        ) : (
          items.map((item) => (
            <KanbanCard key={item.id} item={item} workspaceId={workspaceId} />
          ))
        )}
      </div>
    </div>
  )
}
