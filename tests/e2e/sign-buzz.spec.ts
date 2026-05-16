import { test, expect } from '@playwright/test';

test.describe('Buzzbook signing page', () => {
  test('invalid token shows not-found state', async ({ page }) => {
    await page.goto('/b/invalid-token-xyz', { waitUntil: 'domcontentloaded' });

    // The page renders: "This Buzz doesn't exist" — match on "exist" since the phrase
    // doesn't contain "not exist" as a substring
    await expect(page.getByText(/exist|not found|wrong|deleted/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('signing page has Buzzwin branding in header', async ({ page }) => {
    await page.goto('/b/invalid-token-xyz', { waitUntil: 'domcontentloaded' });

    // Header always renders regardless of token validity
    const logo = page.getByRole('link', { name: /buzzwin/i }).first();
    await expect(logo).toBeVisible();
  });

  test('signing page "Start your own Buzz" link is present', async ({ page }) => {
    await page.goto('/b/invalid-token-xyz', { waitUntil: 'domcontentloaded' });

    const startLink = page.getByRole('link', { name: /start your own buzz/i });
    await expect(startLink).toBeVisible();
    await expect(startLink).toHaveAttribute('href', '/buzzes/new');
  });

  test.fixme(
    'valid buzz token shows signing form',
    // Requires a real Firestore buzz token — cannot be set up without a test Firebase project.
    // To fix: seed a test buzz document and use its shareToken here.
    async ({ page }) => {
      await page.goto('/b/REAL_TOKEN_HERE', { waitUntil: 'networkidle' });
      await expect(page.getByRole('heading', { name: /buzzbook/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /add your page/i })).toBeVisible();
    }
  );
});
