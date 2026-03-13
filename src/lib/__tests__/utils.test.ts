import { describe, it, expect } from "vitest"
import { generateSlug, generatePublicToken, cn } from "@/lib/utils"

describe("generateSlug", () => {
  it("converts text to lowercase kebab-case", () => {
    expect(generateSlug("My Product")).toBe("my-product")
  })

  it("removes special characters", () => {
    expect(generateSlug("Hello World! #2")).toBe("hello-world-2")
  })

  it("removes leading/trailing hyphens", () => {
    expect(generateSlug("--test--")).toBe("test")
  })

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("")
  })

  it("handles numbers", () => {
    expect(generateSlug("Product 2.0")).toBe("product-2-0")
  })
})

describe("generatePublicToken", () => {
  it("generates an 8 character token", () => {
    const token = generatePublicToken()
    expect(token).toHaveLength(8)
  })

  it("generates alphanumeric tokens only", () => {
    const token = generatePublicToken()
    expect(token).toMatch(/^[a-z0-9]+$/)
  })

  it("generates unique tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generatePublicToken()))
    // Very unlikely to have duplicates in 100 tokens
    expect(tokens.size).toBeGreaterThan(90)
  })
})

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
  })

  it("merges tailwind classes", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
  })
})
