import { NextResponse } from "next/server"
import { requireWorkspaceMember } from "@/lib/auth-guard"
import { getSignalById, promoteSignal } from "@/lib/db/queries/signals"
import { createWorkItem } from "@/lib/db/queries/work-items"
import { promoteSignalSchema } from "@/lib/validations/signal"
import { SIGNAL_TYPE_LABELS, SIGNAL_ARR_TIER_LABELS } from "@/lib/constants"

// Map signal type → work item type (best fit)
const SIGNAL_TYPE_TO_WORK_ITEM_TYPE: Record<string, string> = {
  feature: "feature",
  bug: "bug",
  compliance: "ops-task",
  infra: "ops-task",
}

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

    if (signal.status === "promoted") {
      return NextResponse.json({ error: "Signal already promoted" }, { status: 409 })
    }

    const body = await request.json()
    const parsed = promoteSignalSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const { title, priority } = parsed.data

    // Build description with signal context
    const contextLines = [
      `**Signal:** ${signal.publicId}`,
      signal.clientName ? `**Client:** ${signal.clientName}` : null,
      signal.arrTier !== "unknown"
        ? `**ARR Tier:** ${SIGNAL_ARR_TIER_LABELS[signal.arrTier] ?? signal.arrTier}`
        : null,
      `**Type:** ${SIGNAL_TYPE_LABELS[signal.type] ?? signal.type}`,
      `**Source:** ${signal.source}`,
      "",
      "**Signal Description:**",
      signal.description,
      signal.notes ? `\n**Notes:**\n${signal.notes}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n")

    // Create tinypm work item
    const workItemType = SIGNAL_TYPE_TO_WORK_ITEM_TYPE[signal.type] ?? "feature"
    const workItem = await createWorkItem(workspaceId, {
      title,
      description: contextLines,
      type: workItemType as any,
      priority: priority ?? "medium",
      status: "todo",
    })

    // Mark signal as promoted
    const updatedSignal = await promoteSignal(signalId, workItem.id)

    return NextResponse.json(
      {
        signal: updatedSignal,
        workItem,
      },
      { status: 201 }
    )
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
