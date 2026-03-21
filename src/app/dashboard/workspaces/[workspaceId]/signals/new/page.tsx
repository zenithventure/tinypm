"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { useToast } from "@/components/ui/toast"
import {
  SIGNAL_TYPES,
  SIGNAL_SOURCES,
  SIGNAL_ARR_TIERS,
  SIGNAL_TYPE_LABELS,
  SIGNAL_SOURCE_LABELS,
  SIGNAL_ARR_TIER_LABELS,
} from "@/lib/constants"

export default function NewSignalPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const { workspaceId } = params
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState("")
  const [type, setType] = useState<string>("feature")
  const [source, setSource] = useState<string>("manual")
  const [clientName, setClientName] = useState("")
  const [arrTier, setArrTier] = useState<string>("unknown")
  const [notes, setNotes] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/signals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          type,
          source,
          clientName: clientName || undefined,
          arrTier,
          notes: notes || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast(err.error || "Failed to capture signal", { variant: "error" })
        return
      }

      const signal = await res.json()
      toast(`${signal.publicId} captured!`, { variant: "success" })
      router.push(`/dashboard/workspaces/${workspaceId}/signals`)
    } catch {
      toast("Something went wrong", { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Capture Signal"
        description="Record a customer signal for triage and promotion"
      />

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <Textarea
          id="sig-description"
          label="Signal description"
          placeholder="e.g. Client mentioned they need multi-currency support before renewal in Q3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            id="sig-type"
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={SIGNAL_TYPES.map((t) => ({
              value: t,
              label: SIGNAL_TYPE_LABELS[t],
            }))}
          />
          <Select
            id="sig-source"
            label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            options={SIGNAL_SOURCES.map((s) => ({
              value: s,
              label: SIGNAL_SOURCE_LABELS[s],
            }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="sig-client"
            label="Client name (optional)"
            placeholder="e.g. Acme Corp"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <Select
            id="sig-arr-tier"
            label="ARR tier"
            value={arrTier}
            onChange={(e) => setArrTier(e.target.value)}
            options={SIGNAL_ARR_TIERS.map((t) => ({
              value: t,
              label: SIGNAL_ARR_TIER_LABELS[t],
            }))}
          />
        </div>

        <Textarea
          id="sig-notes"
          label="Notes (optional)"
          placeholder="Additional context, links to call recording, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>
            Capture signal
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
