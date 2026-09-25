import { test, expect } from '@playwright/test';

test.describe('Resume Builder Core Flow', () => {
  test('should load the app and navigate to the builder', async ({ page }) => {
    // 1. Navigate to the local server
    await page.goto('http://localhost:3000/');

    // 2. Click the Start Building button
    await page.click('text="Start Building"');
    await page.waitForURL('**/builder/**');

    // 3. Verify we are on Personal step
    await expect(page.locator('label', { hasText: 'Full Name' })).toBeVisible();

    // 4. Fill in Personal Details
    await page.fill('input#personal-fullName', 'Jane Doe');
    await page.fill('input#personal-email', 'jane.doe@example.com');
    await page.fill('input#personal-phone', '+1 555 123 4567');

    // 5. Verify the live preview renders the name
    await expect(page.locator('h1', { hasText: 'Jane Doe' })).toBeVisible();

    // 6. Click Next
    await page.click('button#wizard-next-btn');

    // 7. Verify we are on Links step
    await expect(page.locator('h2', { hasText: 'Links' })).toBeVisible();
  });
});
