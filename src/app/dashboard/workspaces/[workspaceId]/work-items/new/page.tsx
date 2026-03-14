"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { useToast } from "@/components/ui/toast"
import { WORK_ITEM_TYPES, WORK_ITEM_PRIORITIES, TYPE_LABELS, PRIORITY_LABELS } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function NewWorkItemPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const { workspaceId } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const { data: roadmapItems } = useSWR(`/api/workspaces/${workspaceId}/roadmap`, fetcher)

  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<string>("feature")
  const [priority, setPriority] = useState<string>("medium")
  const [roadmapItemId, setRoadmapItemId] = useState(searchParams.get("roadmapItemId") || "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/work-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          priority,
          roadmapItemId: roadmapItemId || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast(err.error || "Failed to create", { variant: "error" })
        return
      }

      const item = await res.json()
      toast(`${item.publicId} created!`, { variant: "success" })
      router.push(`/dashboard/workspaces/${workspaceId}/work-items/${item.id}`)
    } catch {
      toast("Something went wrong", { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="New Work Item" />

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <Input
          id="wi-title"
          label="Title"
          placeholder="e.g. Implement PDF extraction"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          id="wi-desc"
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            id="wi-type"
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={WORK_ITEM_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))}
          />
          <Select
            id="wi-priority"
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={WORK_ITEM_PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
          />
        </div>

        <Select
          id="wi-roadmap"
          label="Roadmap Item (optional)"
          value={roadmapItemId}
          onChange={(e) => setRoadmapItemId(e.target.value)}
          options={[
            { value: "", label: "None" },
            ...(roadmapItems?.map((ri: any) => ({ value: ri.id, label: ri.title })) || []),
          ]}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>
            Create work item
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
