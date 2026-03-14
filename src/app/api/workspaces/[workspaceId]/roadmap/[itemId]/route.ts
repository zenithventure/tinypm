import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { getRoadmapItemById, updateRoadmapItem, deleteRoadmapItem } from "@/lib/db/queries/roadmap-items"
import { updateRoadmapItemSchema } from "@/lib/validations/roadmap-item"

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string; itemId: string } }
) {
  try {
    const { workspaceId, itemId } = params
    await requireWorkspaceMember(workspaceId)
    const item = await getRoadmapItemById(itemId)
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
    await requireWorkspaceMember(workspaceId)
    const body = await request.json()
    const parsed = updateRoadmapItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const item = await updateRoadmapItem(itemId, parsed.data)
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
    await deleteRoadmapItem(itemId)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
