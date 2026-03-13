"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Plus, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { HealthBar } from "@/components/shared/health-bar"
import { useToast } from "@/components/ui/toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function RoadmapPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { data: items, isLoading, mutate } = useSWR(
    `/api/workspaces/${workspaceId}/roadmap`,
    fetcher
  )
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [quarter, setQuarter] = useState("")
  const [theme, setTheme] = useState("")
  const [milestone, setMilestone] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, quarter, theme, milestone }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast(err.error || "Failed to create", { variant: "error" })
        return
      }
      toast("Roadmap item created!", { variant: "success" })
      setShowCreate(false)
      setTitle("")
      setDescription("")
      setQuarter("")
      setTheme("")
      setMilestone("")
      mutate()
    } catch {
      toast("Something went wrong", { variant: "error" })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Roadmap"
        description="Strategic roadmap items for this workspace"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add item
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : items?.length === 0 ? (
        <EmptyState
          icon={<Map className="w-12 h-12" />}
          title="No roadmap items"
          description="Create your first roadmap item to start organizing product work."
          actionLabel="Add roadmap item"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="space-y-3">
          {items?.map((item: any) => (
            <button
              key={item.id}
              onClick={() =>
                router.push(`/dashboard/workspaces/${workspaceId}/roadmap/${item.id}`)
              }
              className="w-full border rounded-xl p-4 bg-white text-left hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <StatusBadge status={item.status} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                {item.quarter && <span className="bg-gray-100 px-2 py-0.5 rounded">{item.quarter}</span>}
                {item.theme && <span className="bg-gray-100 px-2 py-0.5 rounded">{item.theme}</span>}
                {item.milestone && <span className="bg-gray-100 px-2 py-0.5 rounded">{item.milestone}</span>}
              </div>
              {item.health && item.health.total > 0 && (
                <HealthBar
                  percentage={item.health.percentage}
                  total={item.health.total}
                  done={item.health.done}
                  blocked={item.health.blocked}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New roadmap item">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            id="ri-title"
            label="Title"
            placeholder="e.g. PDF extraction v2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            id="ri-desc"
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              id="ri-quarter"
              label="Quarter"
              placeholder="Q2-2026"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
            />
            <Input
              id="ri-theme"
              label="Theme"
              placeholder="Payments"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
            <Input
              id="ri-milestone"
              label="Milestone"
              placeholder="v2.0"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
