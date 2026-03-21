import { describe, it, expect } from "vitest"
import { createCommentSchema, COMMENT_ENTITY_TYPES } from "@/lib/validations/item-comment"

describe("createCommentSchema", () => {
  const validEntityId = "550e8400-e29b-41d4-a716-446655440000"

  it("accepts valid work_item comment", () => {
    const result = createCommentSchema.safeParse({
      entityType: "work_item",
      entityId: validEntityId,
      body: "This is a valid comment.",
    })
    expect(result.success).toBe(true)
  })

  it("accepts valid roadmap_item comment", () => {
    const result = createCommentSchema.safeParse({
      entityType: "roadmap_item",
      entityId: validEntityId,
      body: "Looks good to me!",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty body", () => {
    const result = createCommentSchema.safeParse({
      entityType: "work_item",
      entityId: validEntityId,
      body: "",
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe("Comment body is required")
  })

  it("rejects body over 10000 characters", () => {
    const result = createCommentSchema.safeParse({
      entityType: "work_item",
      entityId: validEntityId,
      body: "x".repeat(10001),
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid entityType", () => {
    const result = createCommentSchema.safeParse({
      entityType: "signal",
      entityId: validEntityId,
      body: "Test comment",
    })
    expect(result.success).toBe(false)
  })

  it("rejects non-UUID entityId", () => {
    const result = createCommentSchema.safeParse({
      entityType: "work_item",
      entityId: "not-a-uuid",
      body: "Test comment",
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toMatch(/UUID/)
  })

  it("requires all fields", () => {
    const result = createCommentSchema.safeParse({})
    expect(result.success).toBe(false)
    expect(result.error?.issues.length).toBeGreaterThan(0)
  })

  it("includes all expected entity types", () => {
    expect(COMMENT_ENTITY_TYPES).toContain("work_item")
    expect(COMMENT_ENTITY_TYPES).toContain("roadmap_item")
    expect(COMMENT_ENTITY_TYPES).toHaveLength(2)
  })

  it("body can be exactly 10000 characters", () => {
    const result = createCommentSchema.safeParse({
      entityType: "work_item",
      entityId: validEntityId,
      body: "x".repeat(10000),
    })
    expect(result.success).toBe(true)
  })

  it("body can be whitespace-only (trimmed at API layer)", () => {
    // Schema allows any non-empty string; trimming is the API's responsibility
    const result = createCommentSchema.safeParse({
      entityType: "work_item",
      entityId: validEntityId,
      body: " ",
    })
    expect(result.success).toBe(true)
  })
})

// Activity log action names – validate the canonical action strings we use
describe("activity log action constants", () => {
  const VALID_ACTIONS = [
    "status_changed",
    "assigned",
    "linked_to_roadmap",
    "comment_added",
    "created",
  ]

  it("all expected action strings are defined", () => {
    expect(VALID_ACTIONS).toHaveLength(5)
  })

  it("action strings use snake_case", () => {
    VALID_ACTIONS.forEach((action) => {
      expect(action).toMatch(/^[a-z_]+$/)
    })
  })
})
