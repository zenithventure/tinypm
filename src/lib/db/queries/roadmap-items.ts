import { db } from "@/lib/db"
import { roadmapItems, workItems } from "@/lib/db/schema"
import { eq, asc, sql } from "drizzle-orm"
import type { CreateRoadmapItemInput, UpdateRoadmapItemInput } from "@/lib/validations/roadmap-item"

export async function getRoadmapItems(workspaceId: string) {
  const items = await db
    .select()
    .from(roadmapItems)
    .where(eq(roadmapItems.workspaceId, workspaceId))
    .orderBy(asc(roadmapItems.sortOrder), asc(roadmapItems.createdAt))

  // Compute health for each roadmap item
  const itemsWithHealth = await Promise.all(
    items.map(async (item) => {
      const health = await computeRoadmapHealth(item.id)
      return { ...item, health }
    })
  )

  return itemsWithHealth
}

export async function getRoadmapItemById(id: string) {
  const result = await db
    .select()
    .from(roadmapItems)
    .where(eq(roadmapItems.id, id))
    .limit(1)

  if (!result[0]) return null

  const health = await computeRoadmapHealth(id)
  return { ...result[0], health }
}

export async function createRoadmapItem(workspaceId: string, data: CreateRoadmapItemInput) {
  // Get next sort order
  const existing = await db
    .select({ maxOrder: sql<number>`COALESCE(MAX(${roadmapItems.sortOrder}), -1)` })
    .from(roadmapItems)
    .where(eq(roadmapItems.workspaceId, workspaceId))

  const nextOrder = (existing[0]?.maxOrder ?? -1) + 1

  const [item] = await db
    .insert(roadmapItems)
    .values({
      workspaceId,
      title: data.title,
      description: data.description || null,
      status: data.status || "planned",
      quarter: data.quarter || null,
      theme: data.theme || null,
      milestone: data.milestone || null,
      sortOrder: nextOrder,
    })
    .returning()

  return item
}

export async function updateRoadmapItem(id: string, data: UpdateRoadmapItemInput) {
  const [item] = await db
    .update(roadmapItems)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(roadmapItems.id, id))
    .returning()

  return item
}

export async function deleteRoadmapItem(id: string) {
  await db.delete(roadmapItems).where(eq(roadmapItems.id, id))
}

export async function reorderRoadmapItems(items: { id: string; sortOrder: number }[]) {
  await Promise.all(
    items.map((item) =>
      db
        .update(roadmapItems)
        .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
        .where(eq(roadmapItems.id, item.id))
    )
  )
}

export async function computeRoadmapHealth(roadmapItemId: string) {
  const items = await db
    .select({ status: workItems.status })
    .from(workItems)
    .where(eq(workItems.roadmapItemId, roadmapItemId))

  const total = items.length
  if (total === 0) return { total: 0, done: 0, inProgress: 0, blocked: 0, percentage: 0 }

  const done = items.filter((i) => i.status === "done").length
  const inProgress = items.filter((i) => i.status === "in-progress" || i.status === "in-review").length
  const blocked = items.filter((i) => i.status === "blocked").length

  return {
    total,
    done,
    inProgress,
    blocked,
    percentage: Math.round((done / total) * 100),
  }
}
