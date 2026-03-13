import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-guard"
import { getUserWorkspaces, createWorkspace } from "@/lib/db/queries/workspaces"
import { createWorkspaceSchema } from "@/lib/validations/workspace"

export async function GET() {
  try {
    const user = await requireAuth()
    const workspaces = await getUserWorkspaces(user.id)
    return NextResponse.json(workspaces)
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const parsed = createWorkspaceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const workspace = await createWorkspace(parsed.data, user.id)
    return NextResponse.json(workspace, { status: 201 })
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (err.message?.includes("unique")) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
