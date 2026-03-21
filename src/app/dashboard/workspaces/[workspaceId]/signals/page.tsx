"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Plus, Inbox, ArrowUpRight, X, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { useToast } from "@/components/ui/toast"
import {
  SIGNAL_TYPES,
  SIGNAL_ARR_TIERS,
  SIGNAL_STATUSES,
  SIGNAL_TYPE_LABELS,
  SIGNAL_ARR_TIER_LABELS,
  SIGNAL_STATUS_LABELS,
  SIGNAL_SOURCE_LABELS,
} from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const ARR_TIER_COLORS: Record<string, string> = {
  enterprise: "bg-purple-100 text-purple-700",
  "mid-market": "bg-blue-100 text-blue-700",
  smb: "bg-green-100 text-green-700",
  unknown: "bg-gray-100 text-gray-600",
}

const TYPE_COLORS: Record<string, string> = {
  feature: "bg-sky-100 text-sky-700",
  bug: "bg-red-100 text-red-700",
  compliance: "bg-orange-100 text-orange-700",
  infra: "bg-slate-100 text-slate-700",
}

const STATUS_COLORS: Record<string, string> = {
  inbox: "bg-yellow-100 text-yellow-700",
  linked: "bg-indigo-100 text-indigo-700",
  promoted: "bg-green-100 text-green-700",
  dismissed: "bg-gray-100 text-gray-500",
}

export default function SignalsPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const { workspaceId } = params
  const router = useRouter()
  const { toast } = useToast()

  const [typeFilter, setTypeFilter] = useState("")
  const [arrTierFilter, setArrTierFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const queryParams = new URLSearchParams()
  if (typeFilter) queryParams.set("type", typeFilter)
  if (arrTierFilter) queryParams.set("arrTier", arrTierFilter)
  if (statusFilter) queryParams.set("status", statusFilter)
  const qs = queryParams.toString()

  const { data: signals, isLoading, mutate } = useSWR(
    `/api/workspaces/${workspaceId}/signals${qs ? `?${qs}` : ""}`,
    fetcher
  )

  async function handleDismiss(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    const res = await fetch(`/api/workspaces/${workspaceId}/signals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "dismissed" }),
    })
    if (res.ok) {
      toast("Signal dismissed", { variant: "success" })
      mutate()
    } else {
      toast("Failed to dismiss", { variant: "error" })
    }
  }

  return (
    <div>
      <PageHeader
        title="Signals"
        description="Capture and triage customer signals before they become work items"
        actions={
          <Button
            onClick={() =>
              router.push(`/dashboard/workspaces/${workspaceId}/signals/new`)
            }
          >
            <Plus className="w-4 h-4 mr-1" /> Capture signal
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "", label: "All statuses" },
            ...SIGNAL_STATUSES.map((s) => ({
              value: s,
              label: SIGNAL_STATUS_LABELS[s],
            })),
          ]}
          className="w-36"
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: "", label: "All types" },
            ...SIGNAL_TYPES.map((t) => ({
              value: t,
              label: SIGNAL_TYPE_LABELS[t],
            })),
          ]}
          className="w-44"
        />
        <Select
          value={arrTierFilter}
          onChange={(e) => setArrTierFilter(e.target.value)}
          options={[
            { value: "", label: "All tiers" },
            ...SIGNAL_ARR_TIERS.map((t) => ({
              value: t,
              label: SIGNAL_ARR_TIER_LABELS[t],
            })),
          ]}
          className="w-40"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : signals?.length === 0 ? (
        <EmptyState
          icon={<Inbox className="w-12 h-12" />}
          title="No signals"
          description={
            !statusFilter || statusFilter === "inbox"
              ? "Capture your first signal to start triaging customer feedback."
              : "No signals match the current filters."
          }
          actionLabel="Capture signal"
          onAction={() =>
            router.push(`/dashboard/workspaces/${workspaceId}/signals/new`)
          }
        />
      ) : (
        <div className="space-y-2">
          {signals?.map((signal: any) => (
            <div
              key={signal.id}
              className="border rounded-lg p-4 bg-white hover:border-blue-300 transition cursor-pointer"
              onClick={() =>
                router.push(
                  `/dashboard/workspaces/${workspaceId}/signals/${signal.id}`
                )
              }
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono shrink-0">
                      {signal.publicId}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[signal.type] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {SIGNAL_TYPE_LABELS[signal.type] ?? signal.type}
                    </span>
                    {signal.arrTier && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${ARR_TIER_COLORS[signal.arrTier] ?? "bg-gray-100"}`}
                      >
                        {SIGNAL_ARR_TIER_LABELS[signal.arrTier] ?? signal.arrTier}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[signal.status] ?? "bg-gray-100"}`}
                    >
                      {SIGNAL_STATUS_LABELS[signal.status] ?? signal.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800 line-clamp-2">
                    {signal.description}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {signal.clientName && (
                      <span className="font-medium text-gray-600">
                        {signal.clientName}
                      </span>
                    )}
                    <span>
                      {SIGNAL_SOURCE_LABELS[signal.source] ?? signal.source}
                    </span>
                    <span>
                      {new Date(signal.capturedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {(signal.status === "inbox" || signal.status === "linked") && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(
                            `/dashboard/workspaces/${workspaceId}/signals/${signal.id}`
                          )
                        }}
                        title="Promote to work item"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                        Promote
                      </Button>
                      <button
                        onClick={(e) => handleDismiss(signal.id, e)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition"
                        title="Dismiss signal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {signal.status === "linked" && signal.promotedRoadmapItemId && (
                    <div className="flex flex-col items-end gap-0.5 ml-1">
                      <span className="text-xs text-indigo-600 font-medium flex items-center gap-0.5">
                        <Map className="w-3 h-3" /> Roadmap
                      </span>
                    </div>
                  )}
                  {signal.status === "promoted" && (
                    <div className="flex flex-col items-end gap-0.5">
                      {signal.promotedWorkItemId && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Work item
                        </span>
                      )}
                      {signal.promotedRoadmapItemId && (
                        <span className="text-xs text-blue-600 font-medium flex items-center gap-0.5">
                          <Map className="w-3 h-3" /> Roadmap
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
