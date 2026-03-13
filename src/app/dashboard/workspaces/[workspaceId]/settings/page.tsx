"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useToast } from "@/components/ui/toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { data: workspace, mutate } = useSWR(`/api/workspaces/${workspaceId}`, fetcher)

  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [githubRepoUrl, setGithubRepoUrl] = useState("")
  const [driveFolderUrl, setDriveFolderUrl] = useState("")
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    if (workspace) {
      setName(workspace.name)
      setSlug(workspace.slug)
      setDescription(workspace.description || "")
      setGithubRepoUrl(workspace.githubRepoUrl || "")
      setDriveFolderUrl(workspace.driveFolderUrl || "")
      setIsPublic(workspace.isPublic)
    }
  }, [workspace])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, githubRepoUrl, driveFolderUrl, isPublic }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast(err.error || "Failed to save", { variant: "error" })
        return
      }
      toast("Settings saved!", { variant: "success" })
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
      await fetch(`/api/workspaces/${workspaceId}`, { method: "DELETE" })
      toast("Workspace deleted", { variant: "success" })
      router.push("/dashboard/workspaces")
    } catch {
      toast("Failed to delete", { variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" />

      <form onSubmit={handleSave} className="max-w-lg space-y-4">
        <Input id="s-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input id="s-slug" label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <Textarea id="s-desc" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input id="s-github" label="GitHub Repo URL" value={githubRepoUrl} onChange={(e) => setGithubRepoUrl(e.target.value)} />
        <Input id="s-drive" label="Google Drive Folder URL" value={driveFolderUrl} onChange={(e) => setDriveFolderUrl(e.target.value)} />

        <div className="flex items-center gap-3">
          <input
            id="s-public"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="s-public" className="text-sm text-gray-700">
            Enable public shareable roadmap at <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">/share/{slug}</code>
          </label>
        </div>

        <Button type="submit" loading={saving}>
          Save settings
        </Button>
      </form>

      {/* Danger zone */}
      <div className="mt-12 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-4">
          Deleting this workspace will permanently remove all roadmap items, work items, and
          artefact links. This action cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setShowDelete(true)}>
          Delete workspace
        </Button>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete workspace?"
        description="This will permanently delete the workspace and all its data. This cannot be undone."
        loading={deleting}
      />
    </div>
  )
}
