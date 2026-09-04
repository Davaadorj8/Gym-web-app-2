import { test, expect } from '@playwright/test';

test.describe('Authentication & Protected Route Flow', () => {
  test('unauthenticated root navigation redirects to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('#login-form-card')).toBeVisible();
  });

  test('login with demo credentials reaches dashboard directory', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email-input', 'admin@archegym.com');
    await page.fill('#login-password-input', 'password123');
    await page.click('#login-submit-btn');

    await expect(page).toHaveURL(/\/dashboard\/directory/, { timeout: 10000 });
  });

  test('deep URL navigation maintains session on refresh', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email-input', 'admin@archegym.com');
    await page.fill('#login-password-input', 'password123');
    await page.click('#login-submit-btn');
    await expect(page).toHaveURL(/\/dashboard\/directory/);

    await page.goto('/dashboard/inventory');
    await expect(page).toHaveURL(/\/dashboard\/inventory/);

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard\/inventory/);
  });
});
