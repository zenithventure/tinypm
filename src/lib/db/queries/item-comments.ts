import { db } from "@/lib/db"
import { itemComments, users } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import type { CreateCommentInput } from "@/lib/validations/item-comment"

export async function getComments(
  workspaceId: string,
  entityType: string,
  entityId: string
) {
  const rows = await db
    .select({
      id: itemComments.id,
      workspaceId: itemComments.workspaceId,
      entityType: itemComments.entityType,
      entityId: itemComments.entityId,
      authorId: itemComments.authorId,
      body: itemComments.body,
      createdAt: itemComments.createdAt,
      updatedAt: itemComments.updatedAt,
      authorName: users.name,
      authorEmail: users.email,
      authorImage: users.image,
    })
    .from(itemComments)
    .innerJoin(users, eq(itemComments.authorId, users.id))
    .where(
      and(
        eq(itemComments.workspaceId, workspaceId),
        eq(itemComments.entityType, entityType),
        eq(itemComments.entityId, entityId)
      )
    )
    .orderBy(desc(itemComments.createdAt))

  return rows
}

export async function createComment(
  workspaceId: string,
  authorId: string,
  data: CreateCommentInput
) {
  const [comment] = await db
    .insert(itemComments)
    .values({
      workspaceId,
      authorId,
      entityType: data.entityType,
      entityId: data.entityId,
      body: data.body,
    })
    .returning()

  return comment
}

export async function getCommentById(commentId: string) {
  const [comment] = await db
    .select()
    .from(itemComments)
    .where(eq(itemComments.id, commentId))
    .limit(1)

  return comment ?? null
}

export async function deleteComment(commentId: string) {
  await db.delete(itemComments).where(eq(itemComments.id, commentId))
}
