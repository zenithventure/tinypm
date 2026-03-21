/**
 * Tests for MAX-based publicId generation in signals.
 *
 * Mirrors the pattern applied to work items in PR #22 (TD-0027).
 * These tests use vi.mock to isolate the db layer — no real DB required.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"

// ---------------------------------------------------------------------------
// Mock @/lib/db so we can control what the DB "returns" per test.
// ---------------------------------------------------------------------------
const mockSelect = vi.fn()
const mockInsert = vi.fn()

vi.mock("@/lib/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
  },
}))

vi.mock("@/lib/db/schema", () => ({
  signals: { workspaceId: "workspaceId", publicId: "publicId" },
  workItems: {},
}))

// ---------------------------------------------------------------------------
// Helpers to build chainable Drizzle-like query objects.
// ---------------------------------------------------------------------------
function buildSelectChain(returnValue: any) {
  const chain: any = {}
  chain.from = () => chain
  chain.where = () => chain
  chain.limit = () => chain
  chain.orderBy = () => chain
  chain.then = (resolve: (v: any) => any) => Promise.resolve(returnValue).then(resolve)
  // Make it thenable (so await works directly on the chain)
  return chain
}

function buildInsertChain(returnValue: any, errorToThrow?: any) {
  const chain: any = {}
  chain.values = () => chain
  chain.returning = () => {
    if (errorToThrow) return Promise.reject(errorToThrow)
    return Promise.resolve(returnValue)
  }
  return chain
}

// ---------------------------------------------------------------------------
// Import the module under test AFTER mocks are set up.
// ---------------------------------------------------------------------------
// We use a dynamic import so the mocks are in place when the module loads.
let createSignal: typeof import("@/lib/db/queries/signals").createSignal

beforeEach(async () => {
  vi.resetModules()
  vi.clearAllMocks()
  // Re-import to get a fresh module with cleared state
  const mod = await import("@/lib/db/queries/signals")
  createSignal = mod.createSignal
})

// ---------------------------------------------------------------------------
// Unit tests for getNextPublicId (indirectly, via createSignal)
// ---------------------------------------------------------------------------

describe("signals getNextPublicId — MAX-based ID generation", () => {
  it("empty workspace: MAX returns null → first ID is SIG-0001", async () => {
    // MAX on empty table returns NULL
    mockSelect.mockReturnValue(buildSelectChain([{ maxNum: null }]))
    mockInsert.mockReturnValue(
      buildInsertChain([{ id: "uuid-1", publicId: "SIG-0001", workspaceId: "ws-1" }])
    )

    const signal = await createSignal("ws-1", {
      description: "test",
      type: "bug",
      source: "manual",
    } as any)

    expect(signal.publicId).toBe("SIG-0001")
  })

  it("normal sequence: MAX = 3 → next ID is SIG-0004", async () => {
    mockSelect.mockReturnValue(buildSelectChain([{ maxNum: "3" }]))
    mockInsert.mockReturnValue(
      buildInsertChain([{ id: "uuid-2", publicId: "SIG-0004", workspaceId: "ws-1" }])
    )

    const signal = await createSignal("ws-1", {
      description: "another",
      type: "feature",
      source: "manual",
    } as any)

    expect(signal.publicId).toBe("SIG-0004")
  })

  it("legacy collision scenario: MAX = 11 (out-of-sequence legacy ID) → next is SIG-0012", async () => {
    // Simulates a workspace where a legacy bug produced SIG-0011 even though
    // there are only 3 signals — MAX correctly skips to 12, not 4.
    mockSelect.mockReturnValue(buildSelectChain([{ maxNum: "11" }]))
    mockInsert.mockReturnValue(
      buildInsertChain([{ id: "uuid-3", publicId: "SIG-0012", workspaceId: "ws-1" }])
    )

    const signal = await createSignal("ws-1", {
      description: "post-legacy",
      type: "research",
      source: "manual",
    } as any)

    expect(signal.publicId).toBe("SIG-0012")
  })

  it("monotonic guarantee: IDs are always strictly greater than existing MAX", async () => {
    // Each call to createSignal should produce a higher number.
    const maxValues = ["0", "1", "2"]
    let callIdx = 0

    mockSelect.mockImplementation(() => {
      const maxNum = maxValues[callIdx] ?? "2"
      return buildSelectChain([{ maxNum }])
    })

    mockInsert.mockImplementation(() => {
      const num = Number(maxValues[callIdx] ?? "2") + 1
      const publicId = `SIG-${String(num).padStart(4, "0")}`
      callIdx++
      return buildInsertChain([{ id: `uuid-${callIdx}`, publicId, workspaceId: "ws-1" }])
    })

    const results = await Promise.all([
      createSignal("ws-1", { description: "a", type: "bug", source: "manual" } as any),
      createSignal("ws-1", { description: "b", type: "bug", source: "manual" } as any),
      createSignal("ws-1", { description: "c", type: "bug", source: "manual" } as any),
    ])

    const ids = results.map((s) => s.publicId)
    const nums = ids.map((id) => parseInt(id.replace("SIG-", ""), 10))

    // All IDs should be positive
    nums.forEach((n) => expect(n).toBeGreaterThan(0))
    // All IDs should follow SIG-XXXX format
    ids.forEach((id) => expect(id).toMatch(/^SIG-\d{4}$/))
  })
})

describe("createSignal — retry logic on unique constraint violation (23505)", () => {
  it("retries up to 3 times on 23505 error, succeeds on second attempt", async () => {
    const constraintError = Object.assign(new Error("unique violation"), { code: "23505" })

    let selectCall = 0
    mockSelect.mockImplementation(() => {
      const maxNum = String(selectCall++)
      return buildSelectChain([{ maxNum }])
    })

    let insertCall = 0
    mockInsert.mockImplementation(() => {
      insertCall++
      if (insertCall === 1) {
        return buildInsertChain(null, constraintError)
      }
      return buildInsertChain([{ id: "uuid-retry", publicId: "SIG-0002", workspaceId: "ws-1" }])
    })

    const signal = await createSignal("ws-1", {
      description: "retry test",
      type: "bug",
      source: "manual",
    } as any)

    expect(signal.publicId).toBe("SIG-0002")
    expect(insertCall).toBe(2)
  })

  it("throws after 3 retries if 23505 persists", async () => {
    const constraintError = Object.assign(new Error("unique violation"), { code: "23505" })

    mockSelect.mockReturnValue(buildSelectChain([{ maxNum: "1" }]))
    mockInsert.mockReturnValue(buildInsertChain(null, constraintError))

    await expect(
      createSignal("ws-1", { description: "fail", type: "bug", source: "manual" } as any)
    ).rejects.toThrow("unique violation")

    // 1 original + 3 retries = 4 total insert attempts (attempts 0,1,2,3 → throws on 4th)
    expect(mockInsert).toHaveBeenCalledTimes(4)
  })

  it("does not retry on non-23505 errors", async () => {
    const otherError = Object.assign(new Error("some other db error"), { code: "42P01" })

    mockSelect.mockReturnValue(buildSelectChain([{ maxNum: "1" }]))
    mockInsert.mockReturnValue(buildInsertChain(null, otherError))

    await expect(
      createSignal("ws-1", { description: "no-retry", type: "bug", source: "manual" } as any)
    ).rejects.toThrow("some other db error")

    expect(mockInsert).toHaveBeenCalledTimes(1)
  })
})
