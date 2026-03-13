import { test, expect } from "@playwright/test"

test.describe("Landing Page", () => {
  test("displays hero section", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Context layer for product work"
    )
  })

  test("displays feature cards", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Roadmap items")).toBeVisible()
    await expect(page.getByText("GitHub integration")).toBeVisible()
    await expect(page.getByText("Drive artefacts")).toBeVisible()
    await expect(page.getByText("Meet transcript parsing")).toBeVisible()
  })

  test("sign in link navigates to login", async ({ page }) => {
    await page.goto("/")
    await page.getByText("Sign in").click()
    await page.waitForURL(/\/login/)
  })

  test("CTA button navigates to login", async ({ page }) => {
    await page.goto("/")
    await page.getByText("Get started free").click()
    await page.waitForURL(/\/login/)
  })

  test("displays footer with version", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("TinyPM v0.0.1")).toBeVisible()
  })
})
