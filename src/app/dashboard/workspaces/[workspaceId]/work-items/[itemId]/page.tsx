"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Trash2, Plus, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { PriorityBadge } from "@/components/shared/priority-badge"
import { TypeIcon, TypeLabel } from "@/components/shared/type-icon"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import {
  WORK_ITEM_TYPES, WORK_ITEM_STATUSES, WORK_ITEM_PRIORITIES,
  ARTEFACT_TYPES, TYPE_LABELS, STATUS_LABELS, PRIORITY_LABELS,
} from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function WorkItemDetailPage({
  params,
}: {
  params: { workspaceId: string; itemId: string }
}) {
  const { workspaceId, itemId } = params
  const router = useRouter()
  const { toast } = useToast()
  const { data: item, isLoading, mutate } = useSWR(
    `/api/workspaces/${workspaceId}/work-items/${itemId}`,
    fetcher
  )

  const [editing, setEditing] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showAddArtefact, setShowAddArtefact] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [addingArtefact, setAddingArtefact] = useState(false)

  // Edit state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")

  // Artefact state
  const [artUrl, setArtUrl] = useState("")
  const [artLabel, setArtLabel] = useState("")
  const [artType, setArtType] = useState("other")

  function startEdit() {
    setTitle(item.title)
    setDescription(item.description || "")
    setType(item.type)
    setStatus(item.status)
    setPriority(item.priority)
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/work-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, status, priority }),
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
      await fetch(`/api/workspaces/${workspaceId}/work-items/${itemId}`, { method: "DELETE" })
      toast("Deleted", { variant: "success" })
      router.push(`/dashboard/workspaces/${workspaceId}/work-items`)
    } catch {
      toast("Failed to delete", { variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  async function handleAddArtefact(e: React.FormEvent) {
    e.preventDefault()
    setAddingArtefact(true)
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/work-items/${itemId}/artefacts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: artUrl, label: artLabel, type: artType }),
        }
      )
      if (!res.ok) {
        toast("Failed to add artefact", { variant: "error" })
        return
      }
      toast("Artefact linked!", { variant: "success" })
      setShowAddArtefact(false)
      setArtUrl("")
      setArtLabel("")
      setArtType("other")
      mutate()
    } catch {
      toast("Something went wrong", { variant: "error" })
    } finally {
      setAddingArtefact(false)
    }
  }

  async function handleDeleteArtefact(artefactId: string) {
    try {
      await fetch(
        `/api/workspaces/${workspaceId}/work-items/${itemId}/artefacts/${artefactId}`,
        { method: "DELETE" }
      )
      toast("Artefact removed", { variant: "success" })
      mutate()
    } catch {
      toast("Failed to remove", { variant: "error" })
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
    return <p className="text-gray-500">Work item not found.</p>
  }

  return (
    <div>
      <button
        onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/work-items`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to work items
      </button>

      {editing ? (
        <form onSubmit={handleSave} className="max-w-lg space-y-4">
          <Input id="e-title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea id="e-desc" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-3 gap-2">
            <Select id="e-type" label="Type" value={type} onChange={(e) => setType(e.target.value)}
              options={WORK_ITEM_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))} />
            <Select id="e-status" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}
              options={WORK_ITEM_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))} />
            <Select id="e-priority" label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}
              options={WORK_ITEM_PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>Save</Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <>
          <PageHeader
            title={`${item.publicId}: ${item.title}`}
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
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
              <TypeIcon type={item.type} className="w-3 h-3" />
              <TypeLabel type={item.type} />
            </span>
            <StatusBadge status={item.status} />
            <PriorityBadge priority={item.priority} />
          </div>

          {item.description && (
            <p className="text-sm text-gray-600 mb-6 whitespace-pre-wrap">{item.description}</p>
          )}

          {/* Decision fields */}
          {item.type === "decision" && (
            <div className="border rounded-lg p-4 bg-gray-50 mb-6 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Decision</h3>
              {item.decisionOutcome && (
                <p className="text-sm"><strong>Outcome:</strong> {item.decisionOutcome}</p>
              )}
              {item.decisionStatus && (
                <p className="text-sm"><strong>Status:</strong> {item.decisionStatus}</p>
              )}
            </div>
          )}

          {/* Artefact links */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Linked Artefacts</h2>
              <Button size="sm" variant="secondary" onClick={() => setShowAddArtefact(true)}>
                <Plus className="w-3 h-3 mr-1" /> Add link
              </Button>
            </div>

            {item.artefactLinks?.length === 0 ? (
              <p className="text-sm text-gray-500">No artefacts linked yet.</p>
            ) : (
              <div className="space-y-2">
                {item.artefactLinks?.map((link: any) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 border rounded-lg p-3 bg-white"
                  >
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded capitalize">
                      {link.type.replace("-", " ")}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 flex-1"
                    >
                      {link.label} <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => handleDeleteArtefact(link.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add artefact modal */}
      <Modal open={showAddArtefact} onClose={() => setShowAddArtefact(false)} title="Add artefact link">
        <form onSubmit={handleAddArtefact} className="space-y-3">
          <Input id="art-url" label="URL" placeholder="https://..." value={artUrl} onChange={(e) => setArtUrl(e.target.value)} required />
          <Input id="art-label" label="Label" placeholder="e.g. PRD document" value={artLabel} onChange={(e) => setArtLabel(e.target.value)} required />
          <Select
            id="art-type"
            label="Type"
            value={artType}
            onChange={(e) => setArtType(e.target.value)}
            options={ARTEFACT_TYPES.map((t) => ({
              value: t,
              label: t.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAddArtefact(false)}>Cancel</Button>
            <Button type="submit" loading={addingArtefact}>Add</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete work item?"
        description="This will permanently delete this work item and all linked artefacts."
        loading={deleting}
      />
    </div>
  )
}
