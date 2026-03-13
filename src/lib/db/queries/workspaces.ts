import { db } from "@/lib/db"
import { workspaces, workspaceMembers } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "@/lib/validations/workspace"

export async function getUserWorkspaces(userId: string) {
  const members = await db
    .select({
      workspace: workspaces,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId))

  return members.map((m) => ({ ...m.workspace, role: m.role }))
}

export async function getWorkspaceById(id: string) {
  const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1)
  return result[0] ?? null
}

export async function getWorkspaceBySlug(slug: string) {
  const result = await db.select().from(workspaces).where(eq(workspaces.slug, slug)).limit(1)
  return result[0] ?? null
}

export async function createWorkspace(data: CreateWorkspaceInput, userId: string) {
  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      githubRepoUrl: data.githubRepoUrl || null,
      driveFolderUrl: data.driveFolderUrl || null,
    })
    .returning()

  // Add creator as owner
  await db.insert(workspaceMembers).values({
    workspaceId: workspace.id,
    userId,
    role: "owner",
  })

  return workspace
}

export async function updateWorkspace(id: string, data: UpdateWorkspaceInput) {
  const [workspace] = await db
    .update(workspaces)
    .set({
      ...data,
      githubRepoUrl: data.githubRepoUrl || null,
      driveFolderUrl: data.driveFolderUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, id))
    .returning()

  return workspace
}

export async function deleteWorkspace(id: string) {
  await db.delete(workspaces).where(eq(workspaces.id, id))
}

export async function getWorkspaceMembers(workspaceId: string) {
  return db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceId))
}

export async function addWorkspaceMember(workspaceId: string, userId: string, role = "member") {
  const [member] = await db
    .insert(workspaceMembers)
    .values({ workspaceId, userId, role })
    .returning()
  return member
}

export async function removeWorkspaceMember(workspaceId: string, memberId: string) {
  await db
    .delete(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.id, memberId)
      )
    )
}
