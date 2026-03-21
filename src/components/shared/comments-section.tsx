"use client"

import { useState } from "react"
import useSWR from "swr"
import { Trash2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface CommentsSectionProps {
  workspaceId: string
  entityType: "work_item" | "roadmap_item"
  entityId: string
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

function getInitials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(" ")
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export function CommentsSection({ workspaceId, entityType, entityId }: CommentsSectionProps) {
  const { toast } = useToast()
  const commentsUrl = `/api/workspaces/${workspaceId}/comments?entityType=${entityType}&entityId=${entityId}`
  const { data: comments, isLoading, mutate } = useSWR(commentsUrl, fetcher)

  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, body: body.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast(data.error || "Failed to post comment", { variant: "error" })
        return
      }
      toast("Comment posted", { variant: "success" })
      setBody("")
      mutate()
    } catch {
      toast("Something went wrong", { variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId: string) {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/comments/${commentId}`,
        { method: "DELETE" }
      )
      if (!res.ok) {
        toast("Failed to delete comment", { variant: "error" })
        return
      }
      toast("Comment deleted", { variant: "success" })
      mutate()
    } catch {
      toast("Something went wrong", { variant: "error" })
    }
  }

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold">Comments</h2>
        {comments && (
          <span className="text-sm text-gray-400">({comments.length})</span>
        )}
      </div>

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <Textarea
          id="new-comment"
          label=""
          placeholder="Add a comment…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <Button type="submit" size="sm" loading={submitting} disabled={!body.trim()}>
            Post comment
          </Button>
        </div>
      </form>

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : comments?.length === 0 ? (
        <p className="text-sm text-gray-400">No comments yet. Be the first to comment.</p>
      ) : (
        <div className="space-y-4">
          {comments?.map((comment: any) => (
            <div key={comment.id} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                {getInitials(comment.authorName, comment.authorEmail)}
              </div>
              <div className="flex-1 bg-gray-50 border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    {comment.authorName || comment.authorEmail}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
