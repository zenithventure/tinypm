import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("landing page loads and shows sign in link", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Context layer for product work")).toBeVisible()
    await expect(page.getByText("Sign in")).toBeVisible()
  })

  test("login page shows Google sign-in button", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByText("Continue with Google")).toBeVisible()
  })

  test("dashboard redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard/workspaces")
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain("/login")
  })

  test("protected API returns 401 when unauthenticated", async ({ request }) => {
    const response = await request.get("/api/workspaces")
    expect(response.status()).toBe(401)
  })

  test("public share API is accessible without auth", async ({ request }) => {
    const response = await request.get("/api/share/nonexistent")
    // Should be 404 (not found), not 401 (unauthorized)
    expect(response.status()).toBe(404)
  })
})
