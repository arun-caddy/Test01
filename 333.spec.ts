import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

 

test('Navigate, import file, and load Visit Definition', async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto(
    'https://sdbsmsmb.adb.us-ashburn-1.oraclecloud.com/ords/r/clnintg/vcim/home',
    { timeout: 100_000, waitUntil: 'domcontentloaded' }
  );

  // 🔐 Login (if required)
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill(process.env.LOGIN_EMAIL as string);
    await page.getByRole('button', { name: 'Next' }).click();

    await page
      .getByRole('textbox', { name: /password/i })
      .fill(process.env.LOGIN_PASSWORD as string);

    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();
  }

  // 🌐 Navigate to study
  await page.getByRole('link', { name: /EDC/i }).click();
  await page.getByRole('link', { name: 'Rave EDC' }).click();

  await page
    .getByRole('row', { name: /CTMS_TEST_5\(DEV\)/ })
    .getByRole('link')
    .first()
    .click();

  await page.getByRole('link', { name: 'Visit Definition' }).click();
  await page.getByRole('button', { name: 'Import' }).click();

  // 📄 Upload CSV file
  const filePath = path.resolve(
    '/Users/arunkumar.manoharan/Library/CloudStorage/OneDrive-SyneosHealth/Documents/Playwright.ts/tests/Data/Visit Definition Download (14).csv'
  );
 
  // ✅ Optional: check if file exists before upload
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
 
  // 🔹 Upload directly via file input (Playwright best practice)
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);
  // Load the file
  await page.getByRole('button', { name: 'Load' }).click();

  // ✅ Validate upload success
  await expect(page.locator('.upload-success')).toHaveText(/upload successful/i);

  // ✅ Confirm uploaded file name
  await expect(page.locator('.uploaded-file-name')).toContainText(
    'Subject Group Download (5).csv'
  );
});
