import { NextResponse } from "next/server"
import { requireWorkspaceMember, requireWorkspaceOwner } from "@/lib/auth-guard"
import { getWorkspaceById, updateWorkspace, deleteWorkspace } from "@/lib/db/queries/workspaces"
import { updateWorkspaceSchema } from "@/lib/validations/workspace"

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params
    await requireWorkspaceMember(workspaceId)
    const workspace = await getWorkspaceById(workspaceId)
    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(workspace)
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params
    await requireWorkspaceMember(workspaceId)
    const body = await request.json()
    const parsed = updateWorkspaceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const workspace = await updateWorkspace(workspaceId, parsed.data)
    return NextResponse.json(workspace)
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params
    await requireWorkspaceOwner(workspaceId)
    await deleteWorkspace(workspaceId)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message?.includes("Forbidden")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
