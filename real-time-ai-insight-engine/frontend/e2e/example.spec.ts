import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AI Insight Engine/i);
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    // Add navigation test here
  });
});

