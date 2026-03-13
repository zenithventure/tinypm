import { z } from "zod"

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
  githubRepoUrl: z.string().url().optional().or(z.literal("")),
  driveFolderUrl: z.string().url().optional().or(z.literal("")),
})

export const updateWorkspaceSchema = createWorkspaceSchema.partial().extend({
  isPublic: z.boolean().optional(),
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>
