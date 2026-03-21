import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { getCommentById, deleteComment } from "@/lib/db/queries/item-comments"

export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string; commentId: string } }
) {
  try {
    const { workspaceId, commentId } = params
    const { user, member } = await requireWorkspaceMember(workspaceId)

    const comment = await getCommentById(commentId)

    if (!comment || comment.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Only author or workspace owner can delete
    const isAuthor = comment.authorId === user.id
    const isOwner = member.role === "owner"

    if (!isAuthor && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await deleteComment(commentId)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
