import { db } from "@/lib/db"
import { workItems, artefactLinks } from "@/lib/db/schema"
import { eq, and, desc, sql } from "drizzle-orm"
import type { CreateWorkItemInput, UpdateWorkItemInput } from "@/lib/validations/work-item"

export async function getWorkItems(
  workspaceId: string,
  filters?: {
    type?: string
    status?: string
    priority?: string
    roadmapItemId?: string
  }
) {
  let query = db
    .select()
    .from(workItems)
    .where(eq(workItems.workspaceId, workspaceId))
    .orderBy(desc(workItems.updatedAt))

  // Note: Drizzle doesn't support dynamic where chaining easily,
  // so we fetch all and filter in memory for v0.0.1
  const items = await query

  return items.filter((item) => {
    if (filters?.type && item.type !== filters.type) return false
    if (filters?.status && item.status !== filters.status) return false
    if (filters?.priority && item.priority !== filters.priority) return false
    if (filters?.roadmapItemId && item.roadmapItemId !== filters.roadmapItemId) return false
    return true
  })
}

export async function getWorkItemById(id: string) {
  const result = await db
    .select()
    .from(workItems)
    .where(eq(workItems.id, id))
    .limit(1)

  if (!result[0]) return null

  const links = await db
    .select()
    .from(artefactLinks)
    .where(eq(artefactLinks.workItemId, id))

  return { ...result[0], artefactLinks: links }
}

async function getNextPublicId(workspaceId: string): Promise<string> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(workItems)
    .where(eq(workItems.workspaceId, workspaceId))

  const num = (result[0]?.count ?? 0) + 1
  return `WI-${String(num).padStart(4, "0")}`
}

export async function createWorkItem(workspaceId: string, data: CreateWorkItemInput) {
  const publicId = await getNextPublicId(workspaceId)

  const [item] = await db
    .insert(workItems)
    .values({
      workspaceId,
      publicId,
      title: data.title,
      description: data.description || null,
      type: data.type,
      status: data.status || "todo",
      priority: data.priority || "medium",
      roadmapItemId: data.roadmapItemId || null,
      assigneeId: data.assigneeId || null,
      decisionOutcome: data.decisionOutcome || null,
      decisionStatus: data.decisionStatus || null,
    })
    .returning()

  return item
}

export async function updateWorkItem(id: string, data: UpdateWorkItemInput) {
  const [item] = await db
    .update(workItems)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(workItems.id, id))
    .returning()

  return item
}

export async function deleteWorkItem(id: string) {
  await db.delete(workItems).where(eq(workItems.id, id))
}
