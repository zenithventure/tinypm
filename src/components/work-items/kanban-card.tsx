"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useRouter } from "next/navigation"
import { GripVertical } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { PriorityBadge } from "@/components/shared/priority-badge"
import { TypeIcon } from "@/components/shared/type-icon"

export interface WorkItemCardData {
  id: string
  publicId: string
  title: string
  type: string
  status: string
  priority: string
}

interface KanbanCardProps {
  item: WorkItemCardData
  workspaceId: string
  isDragOverlay?: boolean
}

export function KanbanCard({ item, workspaceId, isDragOverlay = false }: KanbanCardProps) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white border rounded-lg p-3 
        ${isDragging && !isDragOverlay ? "opacity-40 border-blue-300" : "border-gray-200"}
        ${isDragOverlay ? "shadow-lg rotate-1 cursor-grabbing" : "hover:border-blue-300 hover:shadow-sm"}
        transition-shadow
      `}
    >
      {/* Drag handle + type icon row */}
      <div className="flex items-center gap-1 mb-2">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none p-0.5 -ml-1 rounded"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <TypeIcon type={item.type} className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-400 font-mono">{item.publicId}</span>
      </div>

      {/* Title — clickable to navigate */}
      <button
        onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/work-items/${item.id}`)}
        className="text-sm font-medium text-gray-900 text-left w-full hover:text-blue-600 transition-colors mb-2 leading-snug"
      >
        {item.title}
      </button>

      {/* Badges */}
      <div className="flex gap-1.5 flex-wrap">
        <PriorityBadge priority={item.priority} />
      </div>
    </div>
  )
}
