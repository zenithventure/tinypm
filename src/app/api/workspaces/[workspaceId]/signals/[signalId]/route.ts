import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { getSignalById, updateSignal, deleteSignal } from "@/lib/db/queries/signals"
import { updateSignalSchema } from "@/lib/validations/signal"

export async function GET(
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

    return NextResponse.json(signal)
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
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

    const body = await request.json()
    const parsed = updateSignalSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const updated = await updateSignal(signalId, parsed.data)
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
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

    await deleteSignal(signalId)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
