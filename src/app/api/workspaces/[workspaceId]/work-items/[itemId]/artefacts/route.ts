import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { createArtefactLink } from "@/lib/db/queries/artefact-links"
import { createArtefactLinkSchema } from "@/lib/validations/artefact-link"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; itemId: string }> }
) {
  try {
    const { workspaceId, itemId } = await params
    await requireWorkspaceMember(workspaceId)
    const body = await request.json()
    const parsed = createArtefactLinkSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const link = await createArtefactLink(itemId, parsed.data)
    return NextResponse.json(link, { status: 201 })
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
