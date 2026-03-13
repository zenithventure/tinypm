import { describe, it, expect } from "vitest"
import {
  WORK_ITEM_TYPES,
  WORK_ITEM_STATUSES,
  WORK_ITEM_PRIORITIES,
  ROADMAP_STATUSES,
  ARTEFACT_TYPES,
  STATUS_LABELS,
  TYPE_LABELS,
  PRIORITY_LABELS,
} from "@/lib/constants"

describe("constants", () => {
  it("defines all work item types", () => {
    expect(WORK_ITEM_TYPES).toContain("feature")
    expect(WORK_ITEM_TYPES).toContain("bug")
    expect(WORK_ITEM_TYPES).toContain("decision")
    expect(WORK_ITEM_TYPES).toContain("sales-insight")
    expect(WORK_ITEM_TYPES).toContain("ops-task")
    expect(WORK_ITEM_TYPES).toHaveLength(5)
  })

  it("defines all work item statuses", () => {
    expect(WORK_ITEM_STATUSES).toContain("todo")
    expect(WORK_ITEM_STATUSES).toContain("in-progress")
    expect(WORK_ITEM_STATUSES).toContain("done")
    expect(WORK_ITEM_STATUSES).toContain("blocked")
    expect(WORK_ITEM_STATUSES).toHaveLength(6)
  })

  it("defines all priorities", () => {
    expect(WORK_ITEM_PRIORITIES).toContain("low")
    expect(WORK_ITEM_PRIORITIES).toContain("critical")
    expect(WORK_ITEM_PRIORITIES).toHaveLength(4)
  })

  it("defines all roadmap statuses", () => {
    expect(ROADMAP_STATUSES).toContain("planned")
    expect(ROADMAP_STATUSES).toContain("parked")
    expect(ROADMAP_STATUSES).toHaveLength(4)
  })

  it("defines all artefact types", () => {
    expect(ARTEFACT_TYPES).toContain("google-doc")
    expect(ARTEFACT_TYPES).toContain("github-issue")
    expect(ARTEFACT_TYPES).toContain("meet-transcript")
    expect(ARTEFACT_TYPES).toHaveLength(5)
  })

  it("has labels for all statuses", () => {
    ;[...WORK_ITEM_STATUSES, ...ROADMAP_STATUSES].forEach((status) => {
      expect(STATUS_LABELS[status]).toBeDefined()
    })
  })

  it("has labels for all types", () => {
    WORK_ITEM_TYPES.forEach((type) => {
      expect(TYPE_LABELS[type]).toBeDefined()
    })
  })

  it("has labels for all priorities", () => {
    WORK_ITEM_PRIORITIES.forEach((priority) => {
      expect(PRIORITY_LABELS[priority]).toBeDefined()
    })
  })
})
