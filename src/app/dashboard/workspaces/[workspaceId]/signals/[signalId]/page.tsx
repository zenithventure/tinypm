"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, ArrowUpRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  SIGNAL_TYPE_LABELS,
  SIGNAL_ARR_TIER_LABELS,
  SIGNAL_SOURCE_LABELS,
  SIGNAL_STATUS_LABELS,
  WORK_ITEM_PRIORITIES,
  PRIORITY_LABELS,
} from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SignalDetailPage({
  params,
}: {
  params: { workspaceId: string; signalId: string }
}) {
  const { workspaceId, signalId } = params
  const router = useRouter()
  const { toast } = useToast()

  const { data: signal, isLoading, mutate } = useSWR(
    `/api/workspaces/${workspaceId}/signals/${signalId}`,
    fetcher
  )

  const [promoteOpen, setPromoteOpen] = useState(false)
  const [promoteTitle, setPromoteTitle] = useState("")
  const [promotePriority, setPromotePriority] = useState("medium")
  const [promoting, setPromoting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handlePromote() {
    if (!promoteTitle.trim()) {
      toast("Work item title is required", { variant: "error" })
      return
    }
    setPromoting(true)
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/signals/${signalId}/promote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: promoteTitle,
            priority: promotePriority,
          }),
        }
      )

      if (!res.ok) {
        const err = await res.json()
        toast(err.error || "Failed to promote", { variant: "error" })
        return
      }

      const result = await res.json()
      toast(`Promoted to work item ${result.workItem.publicId}`, { variant: "success" })
      setPromoteOpen(false)
      mutate()
      router.push(
        `/dashboard/workspaces/${workspaceId}/work-items/${result.workItem.id}`
      )
    } catch {
      toast("Something went wrong", { variant: "error" })
    } finally {
      setPromoting(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/signals/${signalId}`,
        { method: "DELETE" }
      )
      if (res.ok) {
        toast("Signal deleted", { variant: "success" })
        router.push(`/dashboard/workspaces/${workspaceId}/signals`)
      } else {
        toast("Failed to delete", { variant: "error" })
      }
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!signal || signal.error) {
    return (
      <div className="text-center py-16 text-gray-500">
        Signal not found.{" "}
        <button
          onClick={() =>
            router.push(`/dashboard/workspaces/${workspaceId}/signals`)
          }
          className="text-blue-600 underline"
        >
          Back to signals
        </button>
      </div>
    )
  }

  const isPromoted = signal.status === "promoted"
  const isDismissed = signal.status === "dismissed"

  return (
    <div>
      <button
        onClick={() =>
          router.push(`/dashboard/workspaces/${workspaceId}/signals`)
        }
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to signals
      </button>

      <PageHeader
        title={signal.publicId}
        description={`Captured ${new Date(signal.capturedAt).toLocaleString()}`}
        actions={
          <div className="flex gap-2">
            {!isPromoted && !isDismissed && (
              <Button
                onClick={() => {
                  setPromoteTitle(
                    signal.clientName
                      ? `[${signal.clientName}] ${signal.description.slice(0, 80)}`
                      : signal.description.slice(0, 80)
                  )
                  setPromoteOpen(true)
                }}
              >
                <ArrowUpRight className="w-4 h-4 mr-1" /> Promote to issue
              </Button>
            )}
            <Button
              variant="danger"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      {/* Signal details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetaCard label="Type" value={SIGNAL_TYPE_LABELS[signal.type] ?? signal.type} />
        <MetaCard
          label="ARR Tier"
          value={SIGNAL_ARR_TIER_LABELS[signal.arrTier] ?? signal.arrTier}
        />
        <MetaCard label="Source" value={SIGNAL_SOURCE_LABELS[signal.source] ?? signal.source} />
        {signal.clientName && (
          <MetaCard label="Client" value={signal.clientName} />
        )}
        <MetaCard
          label="Status"
          value={SIGNAL_STATUS_LABELS[signal.status] ?? signal.status}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            Signal Description
          </h3>
          <div className="bg-white border rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
            {signal.description}
          </div>
        </div>

        {signal.notes && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Notes</h3>
            <div className="bg-white border rounded-lg p-4 text-sm text-gray-600 whitespace-pre-wrap">
              {signal.notes}
            </div>
          </div>
        )}

        {isPromoted && signal.promotedWorkItemId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium">
              ✓ This signal was promoted to a work item.
            </p>
            <button
              onClick={() =>
                router.push(
                  `/dashboard/workspaces/${workspaceId}/work-items/${signal.promotedWorkItemId}`
                )
              }
              className="text-sm text-green-700 underline mt-1"
            >
              View work item →
            </button>
          </div>
        )}
      </div>

      {/* Promote modal */}
      {promoteOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold">Promote to Work Item</h2>
            <p className="text-sm text-gray-500">
              This will create a tinypm work item from this signal, preserving
              all context.
            </p>

            <Input
              id="promote-title"
              label="Work item title"
              value={promoteTitle}
              onChange={(e) => setPromoteTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />

            <Select
              id="promote-priority"
              label="Priority"
              value={promotePriority}
              onChange={(e) => setPromotePriority(e.target.value)}
              options={WORK_ITEM_PRIORITIES.map((p) => ({
                value: p,
                label: PRIORITY_LABELS[p],
              }))}
            />

            <div className="flex gap-3 pt-2">
              <Button onClick={handlePromote} loading={promoting}>
                Promote
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPromoteOpen(false)}
                disabled={promoting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete signal?"
        description="This will permanently delete the signal. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
        loading={deleting}
      />
    </div>
  )
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border rounded-lg p-3">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  )
}
