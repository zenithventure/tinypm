import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { getWorkItemById, updateWorkItem, deleteWorkItem } from "@/lib/db/queries/work-items"
import { logActivity } from "@/lib/db/queries/activity-log"
import { updateWorkItemSchema } from "@/lib/validations/work-item"

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string; itemId: string } }
) {
  try {
    const { workspaceId, itemId } = params
    await requireWorkspaceMember(workspaceId)
    const item = await getWorkItemById(itemId)
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(item)
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { workspaceId: string; itemId: string } }
) {
  try {
    const { workspaceId, itemId } = params
    const { user } = await requireWorkspaceMember(workspaceId)
    const body = await request.json()
    const parsed = updateWorkItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    // Fetch current state for change tracking
    const existing = await getWorkItemById(itemId)
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const item = await updateWorkItem(itemId, parsed.data)

    // Log activity for key field changes
    const actorId = user.id!

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await logActivity(workspaceId, "work_item", itemId, actorId, "status_changed", {
        from: existing.status,
        to: parsed.data.status,
      })
    }

    if (
      "assigneeId" in parsed.data &&
      parsed.data.assigneeId !== existing.assigneeId
    ) {
      await logActivity(workspaceId, "work_item", itemId, actorId, "assigned", {
        from: existing.assigneeId,
        to: parsed.data.assigneeId,
      })
    }

    if (
      "roadmapItemId" in parsed.data &&
      parsed.data.roadmapItemId !== existing.roadmapItemId
    ) {
      await logActivity(workspaceId, "work_item", itemId, actorId, "linked_to_roadmap", {
        from: existing.roadmapItemId,
        to: parsed.data.roadmapItemId,
      })
    }

    return NextResponse.json(item)
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string; itemId: string } }
) {
  try {
    const { workspaceId, itemId } = params
    await requireWorkspaceMember(workspaceId)
    await deleteWorkItem(itemId)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
