"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { PriorityBadge } from "@/components/shared/priority-badge"
import { TypeIcon } from "@/components/shared/type-icon"
import { HealthBar } from "@/components/shared/health-bar"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { ROADMAP_STATUSES, STATUS_LABELS } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function RoadmapItemDetailPage({
  params,
}: {
  params: { workspaceId: string; itemId: string }
}) {
  const { workspaceId, itemId } = params
  const router = useRouter()
  const { toast } = useToast()
  const { data: item, isLoading, mutate } = useSWR(
    `/api/workspaces/${workspaceId}/roadmap/${itemId}`,
    fetcher
  )
  const { data: workItems } = useSWR(
    `/api/workspaces/${workspaceId}/work-items?roadmapItemId=${itemId}`,
    fetcher
  )
  const [editing, setEditing] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Edit state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")
  const [quarter, setQuarter] = useState("")
  const [theme, setTheme] = useState("")
  const [milestone, setMilestone] = useState("")

  function startEdit() {
    setTitle(item.title)
    setDescription(item.description || "")
    setStatus(item.status)
    setQuarter(item.quarter || "")
    setTheme(item.theme || "")
    setMilestone(item.milestone || "")
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/roadmap/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status, quarter, theme, milestone }),
      })
      if (!res.ok) {
        toast("Failed to update", { variant: "error" })
        return
      }
      toast("Updated!", { variant: "success" })
      setEditing(false)
      mutate()
    } catch {
      toast("Something went wrong", { variant: "error" })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/workspaces/${workspaceId}/roadmap/${itemId}`, { method: "DELETE" })
      toast("Deleted", { variant: "success" })
      router.push(`/dashboard/workspaces/${workspaceId}/roadmap`)
    } catch {
      toast("Failed to delete", { variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!item) {
    return <p className="text-gray-500">Roadmap item not found.</p>
  }

  return (
    <div>
      <button
        onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/roadmap`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to roadmap
      </button>

      {editing ? (
        <form onSubmit={handleSave} className="max-w-lg space-y-4">
          <Input id="e-title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea id="e-desc" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select
            id="e-status"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={ROADMAP_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] || s }))}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input id="e-quarter" label="Quarter" value={quarter} onChange={(e) => setQuarter(e.target.value)} />
            <Input id="e-theme" label="Theme" value={theme} onChange={(e) => setTheme(e.target.value)} />
            <Input id="e-milestone" label="Milestone" value={milestone} onChange={(e) => setMilestone(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>Save</Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <>
          <PageHeader
            title={item.title}
            actions={
              <div className="flex gap-2">
                <Button variant="secondary" onClick={startEdit}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            }
          />

          <div className="flex flex-wrap gap-2 mb-4">
            <StatusBadge status={item.status} />
            {item.quarter && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.quarter}</span>}
            {item.theme && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.theme}</span>}
            {item.milestone && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.milestone}</span>}
          </div>

          {item.description && (
            <p className="text-sm text-gray-600 mb-6">{item.description}</p>
          )}

          {item.health && item.health.total > 0 && (
            <HealthBar
              percentage={item.health.percentage}
              total={item.health.total}
              done={item.health.done}
              blocked={item.health.blocked}
              className="mb-6 max-w-md"
            />
          )}

          {/* Work items under this roadmap item */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Work Items</h2>
              <Button
                size="sm"
                onClick={() =>
                  router.push(
                    `/dashboard/workspaces/${workspaceId}/work-items/new?roadmapItemId=${itemId}`
                  )
                }
              >
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>

            {workItems?.length === 0 ? (
              <p className="text-sm text-gray-500">No work items linked to this roadmap item.</p>
            ) : (
              <div className="space-y-2">
                {workItems?.map((wi: any) => (
                  <button
                    key={wi.id}
                    onClick={() =>
                      router.push(`/dashboard/workspaces/${workspaceId}/work-items/${wi.id}`)
                    }
                    className="w-full flex items-center gap-3 border rounded-lg p-3 bg-white text-left hover:border-blue-300 transition"
                  >
                    <TypeIcon type={wi.type} className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400 font-mono">{wi.publicId}</span>
                    <span className="text-sm font-medium flex-1">{wi.title}</span>
                    <PriorityBadge priority={wi.priority} />
                    <StatusBadge status={wi.status} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete roadmap item?"
        description="This will remove the roadmap item and unlink all associated work items. This cannot be undone."
        loading={deleting}
      />
    </div>
  )
}
