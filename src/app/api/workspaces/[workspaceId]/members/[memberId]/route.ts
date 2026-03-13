import { NextResponse } from "next/server"
import { requireWorkspaceOwner } from "@/lib/auth-guard"
import { removeWorkspaceMember } from "@/lib/db/queries/workspaces"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const { workspaceId, memberId } = await params
    await requireWorkspaceOwner(workspaceId)
    await removeWorkspaceMember(workspaceId, memberId)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message?.includes("Forbidden")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
