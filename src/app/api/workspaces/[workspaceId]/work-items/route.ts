import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { getWorkItems, createWorkItem } from "@/lib/db/queries/work-items"
import { createWorkItemSchema } from "@/lib/validations/work-item"

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params
    await requireWorkspaceMember(workspaceId)

    const { searchParams } = new URL(request.url)
    const filters = {
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      roadmapItemId: searchParams.get("roadmapItemId") || undefined,
    }

    const items = await getWorkItems(workspaceId, filters)
    return NextResponse.json(items)
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    console.error("[GET /work-items] Unhandled error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params
    await requireWorkspaceMember(workspaceId)
    const body = await request.json()
    const parsed = createWorkItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const item = await createWorkItem(workspaceId, parsed.data)
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    console.error("[POST /work-items] Unhandled error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
