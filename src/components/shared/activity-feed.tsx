"use client"

import useSWR from "swr"
import { Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface ActivityFeedProps {
  workspaceId: string
  entityType: "work_item" | "roadmap_item"
  entityId: string
}

const ACTION_LABELS: Record<string, string> = {
  status_changed: "changed status",
  assigned: "changed assignee",
  linked_to_roadmap: "updated roadmap link",
  comment_added: "added a comment",
  created: "created this item",
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function parseMetadata(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function ActionDetail({ action, metadata }: { action: string; metadata: Record<string, unknown> | null }) {
  if (!metadata) return null

  if (action === "status_changed" && metadata.from && metadata.to) {
    return (
      <span className="text-xs text-gray-500 ml-1">
        <span className="bg-gray-200 px-1 rounded font-mono">{String(metadata.from)}</span>
        {" → "}
        <span className="bg-blue-100 text-blue-700 px-1 rounded font-mono">{String(metadata.to)}</span>
      </span>
    )
  }

  return null
}

export function ActivityFeed({ workspaceId, entityType, entityId }: ActivityFeedProps) {
  const activityUrl = `/api/workspaces/${workspaceId}/activity?entityType=${entityType}&entityId=${entityId}`
  const { data: log, isLoading } = useSWR(activityUrl, fetcher)

  if (isLoading) {
    return (
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Change Log</h2>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      </div>
    )
  }

  if (!log || log.length === 0) return null

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold">Change Log</h2>
        <span className="text-sm text-gray-400">({log.length})</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />

        <div className="space-y-3 pl-9">
          {log.map((entry: any) => {
            const meta = parseMetadata(entry.metadata)
            const actorLabel = entry.actorName || entry.actorEmail || "System"
            const actionLabel = ACTION_LABELS[entry.action] || entry.action

            return (
              <div key={entry.id} className="relative">
                {/* Dot */}
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-blue-400 bg-white" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">{actorLabel}</span>
                  {" "}
                  {actionLabel}
                  <ActionDetail action={entry.action} metadata={meta} />
                  <span className="text-xs text-gray-400 ml-2">{formatDate(entry.createdAt)}</span>
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
