import { auth } from "@/auth"
import { db } from "@/lib/db"
import { workspaceMembers } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

type AuthenticatedUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session.user as AuthenticatedUser
}

export async function requireWorkspaceMember(workspaceId: string) {
  const user = await requireAuth()

  const member = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, user.id)
      )
    )
    .limit(1)

  if (!member.length) {
    throw new Error("Forbidden")
  }

  return { user, member: member[0] }
}

export async function requireWorkspaceOwner(workspaceId: string) {
  const { user, member } = await requireWorkspaceMember(workspaceId)

  if (member.role !== "owner") {
    throw new Error("Forbidden: owner role required")
  }

  return { user, member }
}
