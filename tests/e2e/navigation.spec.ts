import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
  test('landing page desktop header has logo linking to /', async ({ page }) => {
    await page.goto('/');
    // Logo text or image in the header
    const logo = page.getByRole('link', { name: /buzzwin/i }).first();
    await expect(logo).toBeVisible();
  });

  test('landing page has sign-in CTA', async ({ page }) => {
    await page.goto('/');
    // The JustLogin form should be visible
    const signInBtn = page.getByRole('button', { name: /sign in|sign up|google|continue/i }).first();
    await expect(signInBtn).toBeVisible();
  });

  test('landing Buzzbook CTA link navigates to /buzzes/new', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const buzzLink = page.getByRole('link', { name: /buzzbook/i }).first();
    await expect(buzzLink).toBeVisible({ timeout: 10_000 });
    await expect(buzzLink).toHaveAttribute('href', '/buzzes/new');
  });

  test('login page has back link or logo back to home', async ({ page }) => {
    await page.goto('/login');
    const homeLinks = page.getByRole('link').filter({ hasText: /buzzwin|home/i });
    await expect(homeLinks.first()).toBeVisible();
  });

  test('privacy page links back to home', async ({ page }) => {
    await page.goto('/privacy');
    // Any link to the home page
    const homeLink = page.getByRole('link', { name: /buzzwin|home/i }).first();
    await expect(homeLink).toBeVisible();
  });

  test('tos page links back to home', async ({ page }) => {
    await page.goto('/tos');
    const homeLink = page.getByRole('link', { name: /buzzwin|home/i }).first();
    await expect(homeLink).toBeVisible();
  });
});
