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
  // Use MAX of the numeric portion of existing public IDs rather than COUNT(*).
  //
  // COUNT-based approach (used before this fix) causes duplicate publicId collisions:
  //   (a) Work items created before TD-0022 have non-sequential IDs
  //       (e.g. WI-0011 instead of WI-0002) due to the bigint string concat bug.
  //       When COUNT later reaches 10 and produces WI-0011, a UNIQUE violation
  //       fires → 500 Internal Server Error. This is the TD-0027 regression.
  //   (b) Concurrent inserts can race on the same COUNT value.
  //
  // MAX(numeric_part) always generates an ID strictly greater than all existing IDs,
  // including any legacy wrong-sequence IDs still in the database.
  const result = await db
    .select({
      maxNum: sql<string | null>`MAX(CAST(SUBSTRING(public_id, 4) AS INTEGER))`,
    })
    .from(workItems)
    .where(eq(workItems.workspaceId, workspaceId))

  const num = Number(result[0]?.maxNum ?? 0) + 1
  return `WI-${String(num).padStart(4, "0")}`
}

export async function createWorkItem(
  workspaceId: string,
  data: CreateWorkItemInput,
  _attempt = 0
): Promise<typeof workItems.$inferSelect> {
  const publicId = await getNextPublicId(workspaceId)

  try {
    const [item] = await db
      .insert(workItems)
      .values({
        workspaceId,
        publicId,
        title: data.title,
        description: data.description || null,
        type: data.type,
        status: data.status || "todo",
        statusSource: "manual",
        priority: data.priority || "medium",
        roadmapItemId: data.roadmapItemId || null,
        assigneeId: data.assigneeId || null,
        decisionOutcome: data.decisionOutcome || null,
        decisionStatus: data.decisionStatus || null,
      })
      .returning()

    return item
  } catch (err: any) {
    // Retry on publicId unique constraint violations (race condition between
    // concurrent inserts). MAX-based getNextPublicId re-runs each attempt,
    // picking up the newly inserted ID as the new baseline.
    if (_attempt < 3 && err.code === "23505") {
      return createWorkItem(workspaceId, data, _attempt + 1)
    }
    throw err
  }
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
