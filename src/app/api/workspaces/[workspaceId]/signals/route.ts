import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { getSignals, createSignal } from "@/lib/db/queries/signals"
import { createSignalSchema } from "@/lib/validations/signal"

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params
    await requireWorkspaceMember(workspaceId)

    const { searchParams } = new URL(request.url)
    const filters = {
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      arrTier: searchParams.get("arrTier") || undefined,
      clientName: searchParams.get("clientName") || undefined,
    }

    const items = await getSignals(workspaceId, filters)
    return NextResponse.json(items)
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params
    await requireWorkspaceMember(workspaceId)
    const body = await request.json()
    const parsed = createSignalSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const signal = await createSignal(workspaceId, parsed.data)
    return NextResponse.json(signal, { status: 201 })
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
