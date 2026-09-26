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

  test('should import resume file and populate fields using AI parser', async ({ page }) => {
    // Set desktop viewport so sm: buttons are visible
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Navigate to builder
    await page.goto('http://localhost:3000/builder/default');

    // 2. Click the Import button in header to toggle dropzone if not open
    const importBtn = page.locator('header button', { hasText: 'Import' });
    await importBtn.click();

    // 3. Upload sample-resume.txt into the resume dropzone input
    const fileInput = page.locator('input[accept*=".pdf"]');
    await fileInput.setInputFiles('sample-resume.txt');

    // 4. Wait for upload and parsing completion
    await expect(page.locator('text=Done!').or(page.locator('h1:has-text("John Doe")'))).toBeVisible({ timeout: 20000 });

    // 5. Verify the candidate's name is populated in both form input and preview
    await expect(page.locator('input#personal-fullName')).toHaveValue('John Doe', { timeout: 10000 });
    await expect(page.locator('h1', { hasText: 'John Doe' })).toBeVisible();
  });
});

