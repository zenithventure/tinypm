import { z } from "zod"
import { ARTEFACT_TYPES } from "@/lib/constants"

export const createArtefactLinkSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  label: z.string().min(1, "Label is required").max(200),
  type: z.enum(ARTEFACT_TYPES),
})

export type CreateArtefactLinkInput = z.infer<typeof createArtefactLinkSchema>
