"use client"

import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Plus, Kanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { KanbanBoard } from "@/components/work-items/kanban-board"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function KanbanPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const { workspaceId } = params
  const router = useRouter()

  const { data: items, isLoading, mutate } = useSWR(
    `/api/workspaces/${workspaceId}/work-items`,
    fetcher
  )

  return (
    <div>
      <PageHeader
        title="Kanban Board"
        description="Drag and drop items between status columns"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/work-items`)}
            >
              List view
            </Button>
            <Button
              onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/work-items/new`)}
            >
              <Plus className="w-4 h-4 mr-1" /> New item
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[260px] w-[260px] flex-shrink-0 space-y-2">
              <Skeleton className="h-9 rounded-t-lg rounded-b-none" />
              <Skeleton className="h-20" />
              <Skeleton className="h-16" />
              <Skeleton className="h-20" />
            </div>
          ))}
        </div>
      ) : items?.length === 0 ? (
        <EmptyState
          icon={<Kanban className="w-12 h-12" />}
          title="No work items"
          description="Create your first work item to start tracking product work."
          actionLabel="New work item"
          onAction={() => router.push(`/dashboard/workspaces/${workspaceId}/work-items/new`)}
        />
      ) : (
        <KanbanBoard
          items={items || []}
          workspaceId={workspaceId}
          onStatusChange={() => mutate()}
        />
      )}
    </div>
  )
}
