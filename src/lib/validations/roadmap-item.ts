import { z } from "zod"
import { ROADMAP_STATUSES } from "@/lib/constants"

export const createRoadmapItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(ROADMAP_STATUSES).optional(),
  quarter: z.string().max(20).optional(),
  theme: z.string().max(100).optional(),
  milestone: z.string().max(100).optional(),
})

export const updateRoadmapItemSchema = createRoadmapItemSchema.partial()

export const reorderRoadmapItemsSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })),
})

export type CreateRoadmapItemInput = z.infer<typeof createRoadmapItemSchema>
export type UpdateRoadmapItemInput = z.infer<typeof updateRoadmapItemSchema>
