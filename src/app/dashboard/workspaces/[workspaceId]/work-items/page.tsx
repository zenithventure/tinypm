"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Plus, ListTodo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { PriorityBadge } from "@/components/shared/priority-badge"
import { TypeIcon } from "@/components/shared/type-icon"
import { WORK_ITEM_TYPES, WORK_ITEM_STATUSES, TYPE_LABELS, STATUS_LABELS } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function WorkItemsPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const { workspaceId } = params
  const router = useRouter()
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const queryParams = new URLSearchParams()
  if (typeFilter) queryParams.set("type", typeFilter)
  if (statusFilter) queryParams.set("status", statusFilter)
  const qs = queryParams.toString()

  const { data: items, isLoading } = useSWR(
    `/api/workspaces/${workspaceId}/work-items${qs ? `?${qs}` : ""}`,
    fetcher
  )

  return (
    <div>
      <PageHeader
        title="Work Items"
        description="All work items in this workspace"
        actions={
          <Button onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/work-items/new`)}>
            <Plus className="w-4 h-4 mr-1" /> New item
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: "", label: "All types" },
            ...WORK_ITEM_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] })),
          ]}
          className="w-40"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "", label: "All statuses" },
            ...WORK_ITEM_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
          ]}
          className="w-40"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : items?.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="w-12 h-12" />}
          title="No work items"
          description="Create your first work item to start tracking product work."
          actionLabel="New work item"
          onAction={() => router.push(`/dashboard/workspaces/${workspaceId}/work-items/new`)}
        />
      ) : (
        <div className="space-y-2">
          {items?.map((item: any) => (
            <button
              key={item.id}
              onClick={() =>
                router.push(`/dashboard/workspaces/${workspaceId}/work-items/${item.id}`)
              }
              className="w-full flex items-center gap-3 border rounded-lg p-3 bg-white text-left hover:border-blue-300 transition"
            >
              <TypeIcon type={item.type} className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 font-mono">{item.publicId}</span>
              <span className="text-sm font-medium flex-1">{item.title}</span>
              <PriorityBadge priority={item.priority} />
              <StatusBadge status={item.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
