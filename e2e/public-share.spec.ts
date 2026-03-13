import { test, expect } from "@playwright/test"

test.describe("Public Share Page", () => {
  test("returns 404 for nonexistent workspace slug", async ({ page }) => {
    const response = await page.goto("/share/nonexistent-workspace")
    // Server component should render 404
    await expect(page.getByText("404")).toBeVisible().catch(() => {
      // Different Next.js versions handle 404 differently
      expect(response?.status()).toBe(404)
    })
  })

  test("share API returns 404 for private workspaces", async ({ request }) => {
    const response = await request.get("/api/share/private-workspace")
    expect(response.status()).toBe(404)
  })
})
