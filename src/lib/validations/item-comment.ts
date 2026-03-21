import { z } from "zod"

export const COMMENT_ENTITY_TYPES = ["roadmap_item", "work_item"] as const

export const createCommentSchema = z.object({
  entityType: z.enum(COMMENT_ENTITY_TYPES),
  entityId: z.string().uuid("entityId must be a valid UUID"),
  body: z.string().min(1, "Comment body is required").max(10000),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
