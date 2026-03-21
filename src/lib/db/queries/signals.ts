import { db } from "@/lib/db"
import { signals, workItems } from "@/lib/db/schema"
import { eq, and, desc, sql } from "drizzle-orm"
import type { CreateSignalInput, UpdateSignalInput } from "@/lib/validations/signal"

export type PromoteSignalOptions = {
  workItemId?: string
  roadmapItemId?: string
}

export async function getSignals(
  workspaceId: string,
  filters?: {
    type?: string
    status?: string
    arrTier?: string
    clientName?: string
  }
) {
  const all = await db
    .select()
    .from(signals)
    .where(eq(signals.workspaceId, workspaceId))
    .orderBy(desc(signals.capturedAt))

  return all.filter((s) => {
    if (filters?.type && s.type !== filters.type) return false
    if (filters?.status && s.status !== filters.status) return false
    if (filters?.arrTier && s.arrTier !== filters.arrTier) return false
    if (
      filters?.clientName &&
      !s.clientName?.toLowerCase().includes(filters.clientName.toLowerCase())
    )
      return false
    return true
  })
}

export async function getSignalById(id: string) {
  const result = await db
    .select()
    .from(signals)
    .where(eq(signals.id, id))
    .limit(1)

  return result[0] ?? null
}

async function getNextPublicId(workspaceId: string): Promise<string> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(signals)
    .where(eq(signals.workspaceId, workspaceId))

  const num = (result[0]?.count ?? 0) + 1
  return `SIG-${String(num).padStart(4, "0")}`
}

export async function createSignal(workspaceId: string, data: CreateSignalInput) {
  const publicId = await getNextPublicId(workspaceId)

  const [signal] = await db
    .insert(signals)
    .values({
      workspaceId,
      publicId,
      description: data.description,
      source: data.source ?? "manual",
      clientName: data.clientName ?? null,
      arrTier: data.arrTier ?? "unknown",
      type: data.type,
      notes: data.notes ?? null,
      capturedAt: data.capturedAt ? new Date(data.capturedAt) : new Date(),
    })
    .returning()

  return signal
}

export async function updateSignal(id: string, data: UpdateSignalInput) {
  const [signal] = await db
    .update(signals)
    .set({
      ...data,
      capturedAt: data.capturedAt ? new Date(data.capturedAt) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(signals.id, id))
    .returning()

  return signal
}

export async function promoteSignal(id: string, options: PromoteSignalOptions) {
  const [signal] = await db
    .update(signals)
    .set({
      status: "promoted",
      ...(options.workItemId !== undefined && { promotedWorkItemId: options.workItemId }),
      ...(options.roadmapItemId !== undefined && { promotedRoadmapItemId: options.roadmapItemId }),
      updatedAt: new Date(),
    })
    .where(eq(signals.id, id))
    .returning()

  return signal
}

/**
 * Link a signal to an existing roadmap item (without creating a work item).
 * Sets status to "promoted" and records the roadmap association.
 */
export async function linkSignalToRoadmap(id: string, roadmapItemId: string) {
  return promoteSignal(id, { roadmapItemId })
}

export async function deleteSignal(id: string) {
  await db.delete(signals).where(eq(signals.id, id))
}
