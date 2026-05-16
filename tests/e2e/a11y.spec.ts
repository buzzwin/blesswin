import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('accessibility', () => {
  test('landing page passes axe at critical/serious level', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const violations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (violations.length > 0) {
      const summary = violations.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join('\n');
      expect.soft(violations, `Accessibility violations on /:\n${summary}`).toHaveLength(0);
    }
  });

  test('login page passes axe at critical/serious level', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const violations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (violations.length > 0) {
      const summary = violations.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join('\n');
      expect.soft(violations, `Accessibility violations on /login:\n${summary}`).toHaveLength(0);
    }
  });
});
