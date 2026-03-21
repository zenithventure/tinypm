import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { getSignalById, linkSignalToRoadmap } from "@/lib/db/queries/signals"
import { getRoadmapItemById } from "@/lib/db/queries/roadmap-items"
import { linkSignalToRoadmapSchema } from "@/lib/validations/signal"

/**
 * POST /api/workspaces/:workspaceId/signals/:signalId/link-roadmap
 *
 * Links a signal to an existing roadmap item (without creating a work item).
 * Sets the signal status to "promoted" and records promotedRoadmapItemId.
 *
 * Body: { roadmapItemId: string }
 */
export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string; signalId: string } }
) {
  try {
    const { workspaceId, signalId } = params
    await requireWorkspaceMember(workspaceId)

    const signal = await getSignalById(signalId)
    if (!signal || signal.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (signal.status === "promoted" && signal.promotedRoadmapItemId) {
      return NextResponse.json(
        { error: "Signal is already linked to a roadmap item" },
        { status: 409 }
      )
    }

    const body = await request.json()
    const parsed = linkSignalToRoadmapSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const { roadmapItemId } = parsed.data

    // Verify the roadmap item belongs to this workspace
    const roadmapItem = await getRoadmapItemById(roadmapItemId)
    if (!roadmapItem || roadmapItem.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Roadmap item not found" },
        { status: 404 }
      )
    }

    const updatedSignal = await linkSignalToRoadmap(signalId, roadmapItemId)

    return NextResponse.json(
      { signal: updatedSignal, roadmapItem },
      { status: 200 }
    )
  } catch (err: any) {
    if (err.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
