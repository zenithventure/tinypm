import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { getComments, createComment } from "@/lib/db/queries/item-comments"
import { logActivity } from "@/lib/db/queries/activity-log"
import { createCommentSchema } from "@/lib/validations/item-comment"

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params
    await requireWorkspaceMember(workspaceId)

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entityType")
    const entityId = searchParams.get("entityId")

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "entityType and entityId query params are required" },
        { status: 400 }
      )
    }

    const comments = await getComments(workspaceId, entityType, entityId)
    return NextResponse.json(comments)
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params
    const { user } = await requireWorkspaceMember(workspaceId)

    const body = await request.json()
    const parsed = createCommentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const comment = await createComment(workspaceId, user.id!, parsed.data)

    // Log activity
    await logActivity(
      workspaceId,
      parsed.data.entityType,
      parsed.data.entityId,
      user.id!,
      "comment_added",
      { commentId: comment.id }
    )

    return NextResponse.json(comment, { status: 201 })
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
