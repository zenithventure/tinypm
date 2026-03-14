import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { reorderRoadmapItems } from "@/lib/db/queries/roadmap-items"
import { reorderRoadmapItemsSchema } from "@/lib/validations/roadmap-item"

export async function PATCH(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params
    await requireWorkspaceMember(workspaceId)
    const body = await request.json()
    const parsed = reorderRoadmapItemsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    await reorderRoadmapItems(parsed.data.items)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
