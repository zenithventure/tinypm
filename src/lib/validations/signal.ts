import { z } from "zod"
import {
  SIGNAL_TYPES,
  SIGNAL_SOURCES,
  SIGNAL_ARR_TIERS,
  SIGNAL_STATUSES,
} from "@/lib/constants"

export const createSignalSchema = z.object({
  description: z.string().min(1, "Description is required").max(5000),
  source: z.enum(SIGNAL_SOURCES).optional(),
  clientName: z.string().max(200).optional(),
  arrTier: z.enum(SIGNAL_ARR_TIERS).optional(),
  type: z.enum(SIGNAL_TYPES),
  notes: z.string().max(2000).optional(),
  capturedAt: z.string().datetime().optional(),
})

export const updateSignalSchema = createSignalSchema.partial().extend({
  status: z.enum(SIGNAL_STATUSES).optional(),
})

export const promoteSignalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
})

export type CreateSignalInput = z.infer<typeof createSignalSchema>
export type UpdateSignalInput = z.infer<typeof updateSignalSchema>
export type PromoteSignalInput = z.infer<typeof promoteSignalSchema>
