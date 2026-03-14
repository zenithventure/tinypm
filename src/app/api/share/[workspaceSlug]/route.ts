import { NextResponse } from "next/server"
import { getWorkspaceBySlug } from "@/lib/db/queries/workspaces"
import { getRoadmapItems } from "@/lib/db/queries/roadmap-items"
import { getWorkItems } from "@/lib/db/queries/work-items"

export async function GET(
  request: Request,
  { params }: { params: { workspaceSlug: string } }
) {
  try {
    const { workspaceSlug } = params
    const workspace = await getWorkspaceBySlug(workspaceSlug)

    if (!workspace || !workspace.isPublic) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const roadmapItems = await getRoadmapItems(workspace.id)

    // For each roadmap item, get work items (titles and statuses only - no internal data)
    const roadmapWithWorkItems = await Promise.all(
      roadmapItems.map(async (item) => {
        const workItemsList = await getWorkItems(workspace.id, { roadmapItemId: item.id })
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          status: item.status,
          quarter: item.quarter,
          theme: item.theme,
          milestone: item.milestone,
          health: item.health,
          workItems: workItemsList.map((wi) => ({
            id: wi.id,
            title: wi.title,
            status: wi.status,
            type: wi.type,
          })),
        }
      })
    )

    return NextResponse.json({
      workspace: {
        name: workspace.name,
        description: workspace.description,
      },
      roadmapItems: roadmapWithWorkItems,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
