import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { getActivityLog } from "@/lib/db/queries/activity-log"

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

    const log = await getActivityLog(workspaceId, entityType, entityId)
    return NextResponse.json(log)
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
