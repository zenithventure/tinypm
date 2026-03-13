import { z } from "zod"
import { WORK_ITEM_TYPES, WORK_ITEM_STATUSES, WORK_ITEM_PRIORITIES } from "@/lib/constants"

export const createWorkItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  type: z.enum(WORK_ITEM_TYPES),
  status: z.enum(WORK_ITEM_STATUSES).optional(),
  priority: z.enum(WORK_ITEM_PRIORITIES).optional(),
  roadmapItemId: z.string().uuid().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  decisionOutcome: z.string().max(2000).optional(),
  decisionStatus: z.enum(["proposed", "approved", "superseded"]).optional(),
})

export const updateWorkItemSchema = createWorkItemSchema.partial()

export type CreateWorkItemInput = z.infer<typeof createWorkItemSchema>
export type UpdateWorkItemInput = z.infer<typeof updateWorkItemSchema>
