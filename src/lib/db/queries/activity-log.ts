import { db } from "@/lib/db"
import { activityLog, users } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"

export async function getActivityLog(
  workspaceId: string,
  entityType: string,
  entityId: string
) {
  const rows = await db
    .select({
      id: activityLog.id,
      workspaceId: activityLog.workspaceId,
      entityType: activityLog.entityType,
      entityId: activityLog.entityId,
      actorId: activityLog.actorId,
      action: activityLog.action,
      metadata: activityLog.metadata,
      createdAt: activityLog.createdAt,
      actorName: users.name,
      actorEmail: users.email,
      actorImage: users.image,
    })
    .from(activityLog)
    .leftJoin(users, eq(activityLog.actorId, users.id))
    .where(
      and(
        eq(activityLog.workspaceId, workspaceId),
        eq(activityLog.entityType, entityType),
        eq(activityLog.entityId, entityId)
      )
    )
    .orderBy(desc(activityLog.createdAt))

  return rows
}

export async function logActivity(
  workspaceId: string,
  entityType: string,
  entityId: string,
  actorId: string | null,
  action: string,
  metadata?: Record<string, unknown>
) {
  const [entry] = await db
    .insert(activityLog)
    .values({
      workspaceId,
      entityType,
      entityId,
      actorId: actorId ?? undefined,
      action,
      metadata: metadata ?? null,
    })
    .returning()

  return entry
}
