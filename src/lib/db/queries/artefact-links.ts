import { db } from "@/lib/db"
import { artefactLinks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { CreateArtefactLinkInput } from "@/lib/validations/artefact-link"

export async function getArtefactLinks(workItemId: string) {
  return db
    .select()
    .from(artefactLinks)
    .where(eq(artefactLinks.workItemId, workItemId))
}

export async function createArtefactLink(workItemId: string, data: CreateArtefactLinkInput) {
  const [link] = await db
    .insert(artefactLinks)
    .values({
      workItemId,
      url: data.url,
      label: data.label,
      type: data.type,
    })
    .returning()

  return link
}

export async function deleteArtefactLink(id: string) {
  await db.delete(artefactLinks).where(eq(artefactLinks.id, id))
}
