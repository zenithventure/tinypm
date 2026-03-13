"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/shared/page-header"
import { useToast } from "@/components/ui/toast"
import { generateSlug } from "@/lib/utils"

export default function NewWorkspacePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [githubRepoUrl, setGithubRepoUrl] = useState("")
  const [driveFolderUrl, setDriveFolderUrl] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, githubRepoUrl, driveFolderUrl }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast(err.error || "Failed to create workspace", { variant: "error" })
        return
      }

      const workspace = await res.json()
      toast("Workspace created!", { variant: "success" })
      router.push(`/dashboard/workspaces/${workspace.id}`)
    } catch {
      toast("Something went wrong", { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Create workspace" />

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <Input
          id="name"
          label="Workspace name"
          placeholder="e.g. VeloQuote"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setSlug(generateSlug(e.target.value))
          }}
          required
        />

        <Input
          id="slug"
          label="Slug"
          placeholder="e.g. veloquote"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />

        <Textarea
          id="description"
          label="Description (optional)"
          placeholder="What is this product about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          id="github"
          label="GitHub repo URL (optional)"
          placeholder="https://github.com/org/repo"
          value={githubRepoUrl}
          onChange={(e) => setGithubRepoUrl(e.target.value)}
        />

        <Input
          id="drive"
          label="Google Drive folder URL (optional)"
          placeholder="https://drive.google.com/drive/folders/..."
          value={driveFolderUrl}
          onChange={(e) => setDriveFolderUrl(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>
            Create workspace
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
