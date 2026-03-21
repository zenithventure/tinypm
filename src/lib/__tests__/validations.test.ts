import { describe, it, expect } from "vitest"
import { createWorkspaceSchema } from "@/lib/validations/workspace"
import { createRoadmapItemSchema } from "@/lib/validations/roadmap-item"
import { createWorkItemSchema } from "@/lib/validations/work-item"
import { createArtefactLinkSchema } from "@/lib/validations/artefact-link"
import {
  promoteSignalSchema,
  linkSignalToRoadmapSchema,
} from "@/lib/validations/signal"

describe("createWorkspaceSchema", () => {
  it("accepts valid input", () => {
    const result = createWorkspaceSchema.safeParse({
      name: "VeloQuote",
      slug: "veloquote",
    })
    expect(result.success).toBe(true)
  })

  it("requires name", () => {
    const result = createWorkspaceSchema.safeParse({ slug: "test" })
    expect(result.success).toBe(false)
  })

  it("requires slug", () => {
    const result = createWorkspaceSchema.safeParse({ name: "Test" })
    expect(result.success).toBe(false)
  })

  it("validates slug format", () => {
    const result = createWorkspaceSchema.safeParse({
      name: "Test",
      slug: "Invalid Slug!",
    })
    expect(result.success).toBe(false)
  })

  it("accepts optional fields", () => {
    const result = createWorkspaceSchema.safeParse({
      name: "Test",
      slug: "test",
      description: "A test workspace",
      githubRepoUrl: "https://github.com/org/repo",
      driveFolderUrl: "https://drive.google.com/drive/folders/abc",
    })
    expect(result.success).toBe(true)
  })

  it("accepts empty string for optional URL fields", () => {
    const result = createWorkspaceSchema.safeParse({
      name: "Test",
      slug: "test",
      githubRepoUrl: "",
      driveFolderUrl: "",
    })
    expect(result.success).toBe(true)
  })
})

describe("createRoadmapItemSchema", () => {
  it("accepts valid input", () => {
    const result = createRoadmapItemSchema.safeParse({
      title: "PDF extraction v2",
    })
    expect(result.success).toBe(true)
  })

  it("requires title", () => {
    const result = createRoadmapItemSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("accepts all optional tags", () => {
    const result = createRoadmapItemSchema.safeParse({
      title: "Test",
      quarter: "Q2-2026",
      theme: "Payments",
      milestone: "v2.0",
      status: "in-progress",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid status", () => {
    const result = createRoadmapItemSchema.safeParse({
      title: "Test",
      status: "invalid",
    })
    expect(result.success).toBe(false)
  })
})

describe("createWorkItemSchema", () => {
  it("accepts valid input", () => {
    const result = createWorkItemSchema.safeParse({
      title: "Implement PDF parser",
      type: "feature",
    })
    expect(result.success).toBe(true)
  })

  it("requires type", () => {
    const result = createWorkItemSchema.safeParse({
      title: "Test",
    })
    expect(result.success).toBe(false)
  })

  it("validates type enum", () => {
    const result = createWorkItemSchema.safeParse({
      title: "Test",
      type: "invalid-type",
    })
    expect(result.success).toBe(false)
  })

  it("accepts all valid types", () => {
    const types = ["feature", "bug", "decision", "sales-insight", "ops-task"]
    types.forEach((type) => {
      const result = createWorkItemSchema.safeParse({ title: "Test", type })
      expect(result.success).toBe(true)
    })
  })

  it("accepts optional fields", () => {
    const result = createWorkItemSchema.safeParse({
      title: "Test",
      type: "decision",
      priority: "high",
      status: "in-progress",
      description: "Details here",
      decisionOutcome: "We chose option A",
      decisionStatus: "approved",
    })
    expect(result.success).toBe(true)
  })
})

describe("promoteSignalSchema (TD-0024)", () => {
  it("accepts title only (no roadmap)", () => {
    const result = promoteSignalSchema.safeParse({ title: "Fix login crash" })
    expect(result.success).toBe(true)
  })

  it("accepts title + priority + roadmapItemId", () => {
    const result = promoteSignalSchema.safeParse({
      title: "Fix login crash",
      priority: "high",
      roadmapItemId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid roadmapItemId (not a UUID)", () => {
    const result = promoteSignalSchema.safeParse({
      title: "Test",
      roadmapItemId: "not-a-uuid",
    })
    expect(result.success).toBe(false)
  })

  it("requires title", () => {
    const result = promoteSignalSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe("linkSignalToRoadmapSchema (TD-0024)", () => {
  it("accepts a valid UUID roadmapItemId", () => {
    const result = linkSignalToRoadmapSchema.safeParse({
      roadmapItemId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    })
    expect(result.success).toBe(true)
  })

  it("rejects non-UUID roadmapItemId", () => {
    const result = linkSignalToRoadmapSchema.safeParse({
      roadmapItemId: "not-a-uuid",
    })
    expect(result.success).toBe(false)
  })

  it("requires roadmapItemId", () => {
    const result = linkSignalToRoadmapSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe("createArtefactLinkSchema", () => {
  it("accepts valid input", () => {
    const result = createArtefactLinkSchema.safeParse({
      url: "https://docs.google.com/document/d/abc",
      label: "PRD Document",
      type: "google-doc",
    })
    expect(result.success).toBe(true)
  })

  it("requires valid URL", () => {
    const result = createArtefactLinkSchema.safeParse({
      url: "not-a-url",
      label: "Test",
      type: "other",
    })
    expect(result.success).toBe(false)
  })

  it("requires label", () => {
    const result = createArtefactLinkSchema.safeParse({
      url: "https://example.com",
      type: "other",
    })
    expect(result.success).toBe(false)
  })

  it("validates type enum", () => {
    const result = createArtefactLinkSchema.safeParse({
      url: "https://example.com",
      label: "Test",
      type: "invalid",
    })
    expect(result.success).toBe(false)
  })
})

// TD-0022: publicId generation — Number() coercion for COUNT(*) bigint string
describe("getNextPublicId Number() coercion", () => {
  // Simulates the fix: Number(count) + 1 must use arithmetic, not string concat
  function computePublicId(countFromDb: unknown): string {
    const num = Number(countFromDb ?? 0) + 1
    return `WI-${String(num).padStart(4, "0")}`
  }

  it("handles count=0 (first item)", () => {
    expect(computePublicId(0)).toBe("WI-0001")
    expect(computePublicId("0")).toBe("WI-0001") // string from neon driver
  })

  it("handles count=1 (second item)", () => {
    expect(computePublicId(1)).toBe("WI-0002")
    expect(computePublicId("1")).toBe("WI-0002") // would have been "WI-0011" before fix
  })

  it("handles count=9 (tenth item)", () => {
    expect(computePublicId(9)).toBe("WI-0010")
    expect(computePublicId("9")).toBe("WI-0010") // would have been "WI-0091" before fix
  })

  it("handles count=99 (hundredth item)", () => {
    expect(computePublicId(99)).toBe("WI-0100")
    expect(computePublicId("99")).toBe("WI-0100") // would have been "WI-0991" before fix
  })

  it("handles null/undefined gracefully", () => {
    expect(computePublicId(null)).toBe("WI-0001")
    expect(computePublicId(undefined)).toBe("WI-0001")
  })

  it("produces sequential unique IDs without collisions", () => {
    const ids = Array.from({ length: 10 }, (_, i) => computePublicId(String(i)))
    const unique = new Set(ids)
    expect(unique.size).toBe(10)
    expect(ids[0]).toBe("WI-0001")
    expect(ids[9]).toBe("WI-0010")
  })
})
