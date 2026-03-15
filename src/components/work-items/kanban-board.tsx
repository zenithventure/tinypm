"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard, WorkItemCardData } from "./kanban-card"
import { WORK_ITEM_STATUSES, STATUS_LABELS, WorkItemStatus } from "@/lib/constants"
import { useToast } from "@/components/ui/toast"

interface KanbanBoardProps {
  items: WorkItemCardData[]
  workspaceId: string
  onStatusChange?: (itemId: string, newStatus: string) => void
}

// Columns to display on the Kanban board (exclude cancelled from primary view but keep it accessible)
const KANBAN_COLUMNS: WorkItemStatus[] = ["todo", "in-progress", "in-review", "done", "blocked", "cancelled"]

export function KanbanBoard({ items: initialItems, workspaceId, onStatusChange }: KanbanBoardProps) {
  const [items, setItems] = useState<WorkItemCardData[]>(initialItems)
  const [activeItem, setActiveItem] = useState<WorkItemCardData | null>(null)
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  )

  const getColumnItems = useCallback(
    (status: string) => items.filter((item) => item.status === status),
    [items]
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const item = items.find((i) => i.id === active.id)
    if (item) setActiveItem(item)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    const draggedItem = items.find((i) => i.id === active.id)
    if (!draggedItem) return

    const newStatus = over.id as string
    if (draggedItem.status === newStatus) return

    // Optimistic update
    const prevItems = items
    setItems((prev) =>
      prev.map((item) =>
        item.id === draggedItem.id ? { ...item, status: newStatus } : item
      )
    )
    setUpdatingIds((prev) => new Set(prev).add(draggedItem.id))

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/work-items/${draggedItem.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      onStatusChange?.(draggedItem.id, newStatus)
      toast(`Moved to "${STATUS_LABELS[newStatus] || newStatus}"`, { variant: "success" })
    } catch (err) {
      // Revert on error
      setItems(prevItems)
      toast("Failed to update status. Please try again.", { variant: "error" })
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev)
        next.delete(draggedItem.id)
        return next
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            label={STATUS_LABELS[status] || status}
            items={getColumnItems(status)}
            workspaceId={workspaceId}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeItem ? (
          <KanbanCard item={activeItem} workspaceId={workspaceId} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
