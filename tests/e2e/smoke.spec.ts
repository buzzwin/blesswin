import { test, expect } from '@playwright/test';

const PUBLIC_ROUTES: Array<{ path: string; heading: string | RegExp }> = [
  { path: '/', heading: /celebrate|buzzbook|matter/i },
  { path: '/login', heading: /sign in|log in|welcome|buzzwin/i },
  { path: '/forgot-password', heading: /forgot|reset|password/i },
  { path: '/how-it-works', heading: /how it works|how buzzwin/i },
  { path: '/privacy', heading: /privacy/i },
  { path: '/tos', heading: /terms/i },
  { path: '/disclaimer', heading: /disclaimer/i },
  { path: '/real-stories', heading: /stories|story/i },
  // Blog uses PublicationLayout: heading is "Buzzwin Journal — wellness & rituals"
  { path: '/blog', heading: /journal|wellness|ritual|buzzwin/i }
];

// Console errors to ignore (known third-party / env noise)
const IGNORED_ERRORS = [
  /firebase/i,
  /hydration/i,
  /Warning:/i,
  /ResizeObserver/i,
  /Cannot update a component/i
];

for (const { path, heading } of PUBLIC_ROUTES) {
  test(`smoke: ${path} loads with correct heading`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!IGNORED_ERRORS.some((re) => re.test(text))) {
          consoleErrors.push(text);
        }
      }
    });

    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);

    // At least one heading visible somewhere on page (first() handles pages with multiple matching headings)
    await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 10_000 });

    expect(consoleErrors, `Console errors on ${path}: ${consoleErrors.join('\n')}`).toHaveLength(0);
  });
}

test('smoke: unknown route shows 404 HTTP status', async ({ page }) => {
  // Single-segment paths match pages/[id]/index.tsx (user profile catch-all).
  // Use a two-segment path with a first segment that isn't a real directory.
  const response = await page.goto('/no-such-page-segment/also-not-real-xyz');
  expect(response?.status()).toBe(404);
});
