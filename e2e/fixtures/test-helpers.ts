import { Page } from "@playwright/test"

/**
 * Helper to set up authenticated session for E2E tests.
 * In v0.0.1, tests that require auth should be run against
 * a test environment with a seeded user.
 *
 * For now, unauthenticated tests cover the public pages.
 * Full auth E2E tests will be added when test auth mocking is set up.
 */
export async function setupTestAuth(page: Page) {
  // TODO: Implement test auth cookie injection or mock OAuth
  // This will be implemented when we set up a test environment
  // with seeded database and auth bypass for testing
}

/**
 * Helper to seed test data via API.
 * Requires an authenticated session.
 */
export async function seedWorkspace(page: Page, name: string) {
  // TODO: Implement via API calls with auth
}
