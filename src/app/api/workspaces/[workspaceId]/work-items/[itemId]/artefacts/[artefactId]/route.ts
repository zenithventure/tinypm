import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { deleteArtefactLink } from "@/lib/db/queries/artefact-links"

export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string; itemId: string; artefactId: string } }
) {
  try {
    const { workspaceId, artefactId } = params
    await requireWorkspaceMember(workspaceId)
    await deleteArtefactLink(artefactId)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
