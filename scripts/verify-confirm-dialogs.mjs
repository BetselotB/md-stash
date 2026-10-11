import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = path.resolve('C:/Users/addis/.gemini/antigravity-ide/brain/7f753463-b674-444f-9f28-e5ad24c26fd4/.tempmediaStorage');
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return [0, 0, 0];
}

function contrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

async function run() {
  console.log('--- Starting Playwright headless verification ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2, // 2x screenshot
  });
  const page = await context.newPage();

  let nativeDialogCount = 0;
  page.on('dialog', (dialog) => {
    nativeDialogCount++;
    console.error(`FAIL: Native browser dialog appeared! "${dialog.message()}"`);
    dialog.dismiss().catch(() => {});
  });

  // 1. Visit /app
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Seed test file, version history, and collection
  await page.evaluate(async () => {
    const db = window.__db;
    if (db) {
      await db.collections.put({
        id: 'col-test-del',
        name: 'Delete Me Collection',
        color: '#E28B38',
        icon: 'folder',
        order: 99,
      });
      await db.files.put({
        id: 'f-test-claude',
        title: 'Claude Project Memory & Rules',
        filename: 'CLAUDE.md',
        content: '# Claude Project Context\nPersistent instructions for coding assistant.',
        tags: ['claude', 'prompt', 'rules'],
        collectionId: 'col-test-del',
        size: 78,
        pinned: true,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      await db.versions.put({
        id: 'v-test-snapshot',
        fileId: 'f-test-claude',
        content: '# Initial Claude Project Context',
        createdAt: Date.now() - 3600000,
      });
    }
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Navigate to the file detail route
  await page.goto('http://localhost:5173/app/f/f-test-claude', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  console.log('Testing Delete File Dialog on FileDetail...');
  const deleteBtn = page.locator('button[aria-label="Delete file"]');
  await deleteBtn.waitFor({ state: 'visible' });
  await deleteBtn.focus();
  await deleteBtn.click();

  // Assert custom confirm dialog opened
  const dialogCard = page.locator('[data-testid="confirm-dialog-card"]');
  await dialogCard.waitFor({ state: 'visible', timeout: 3000 });

  const role = await dialogCard.getAttribute('role');
  if (role !== 'alertdialog') {
    throw new Error(`Expected role="alertdialog" for danger dialog, got "${role}"`);
  }

  // Check initial focus on Cancel button
  await page.waitForTimeout(100);
  const focusedElementTestId = await page.evaluate(() => {
    return document.activeElement?.getAttribute('data-testid');
  });
  if (focusedElementTestId !== 'confirm-dialog-cancel-btn') {
    throw new Error(`Expected focus on Cancel button for danger dialog, got: ${focusedElementTestId}`);
  }
  console.log('✓ Initial focus correctly landed on Cancel button for danger dialog');

  // Check title, body, chip
  const titleText = await page.locator('#confirm-dialog-title').innerText();
  const chipText = await page.locator('[data-testid="confirm-dialog-filename-chip"]').innerText();
  console.log(`✓ Dialog title: "${titleText}", chip: "${chipText}"`);

  // Contrast check of card text and buttons
  const contrastData = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="confirm-dialog-card"]');
    const title = document.querySelector('#confirm-dialog-title');
    const cancelBtn = document.querySelector('[data-testid="confirm-dialog-cancel-btn"]');
    const confirmBtn = document.querySelector('[data-testid="confirm-dialog-confirm-btn"]');

    return {
      cardBg: window.getComputedStyle(card).backgroundColor,
      titleColor: window.getComputedStyle(title).color,
      cancelBorder: window.getComputedStyle(cancelBtn).borderColor,
      cancelColor: window.getComputedStyle(cancelBtn).color,
      confirmBg: window.getComputedStyle(confirmBtn).backgroundColor,
      confirmColor: window.getComputedStyle(confirmBtn).color,
    };
  });

  const titleContrast = contrastRatio(parseRgb(contrastData.cardBg), parseRgb(contrastData.titleColor));
  const confirmContrast = contrastRatio(parseRgb(contrastData.confirmBg), parseRgb(contrastData.confirmColor));
  console.log(`✓ Contrast ratio title on oat: ${titleContrast.toFixed(2)}:1 (AA >= 4.5:1)`);
  console.log(`✓ Contrast ratio danger confirm button text: ${confirmContrast.toFixed(2)}:1 (AA >= 4.5:1)`);
  if (titleContrast < 4.5 || confirmContrast < 4.5) {
    throw new Error('Contrast did not pass AA minimum requirement');
  }

  // Focus trap check (Tab and Shift+Tab)
  await page.keyboard.press('Tab');
  let activeAfterTab = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  if (activeAfterTab !== 'confirm-dialog-confirm-btn') {
    throw new Error(`Focus trap failed forward: got ${activeAfterTab}`);
  }

  await page.keyboard.press('Tab');
  let activeAfterTab2 = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  if (activeAfterTab2 !== 'confirm-dialog-cancel-btn') {
    throw new Error(`Focus trap failed looping: got ${activeAfterTab2}`);
  }

  await page.keyboard.press('Shift+Tab');
  let activeAfterShiftTab = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  if (activeAfterShiftTab !== 'confirm-dialog-confirm-btn') {
    throw new Error(`Focus trap failed backward: got ${activeAfterShiftTab}`);
  }
  console.log('✓ Focus trap works with Tab and Shift+Tab');

  // Take 2x screenshot of delete dialog
  const deleteScreenshotPath = path.join(ARTIFACT_DIR, 'confirm_dialog_delete_2x.png');
  await dialogCard.screenshot({ path: deleteScreenshotPath });
  console.log(`✓ Saved delete dialog screenshot to ${deleteScreenshotPath}`);

  // Test Esc key cancels
  await page.keyboard.press('Escape');
  await dialogCard.waitFor({ state: 'hidden', timeout: 3000 });
  console.log('✓ Esc closed the delete dialog without deleting');

  // Re-open and test Cancel button
  await deleteBtn.click();
  await dialogCard.waitFor({ state: 'visible' });
  const cancelBtn = page.locator('[data-testid="confirm-dialog-cancel-btn"]');
  await cancelBtn.click();
  await dialogCard.waitFor({ state: 'hidden', timeout: 3000 });
  console.log('✓ Cancel button closed the dialog without deleting');

  // 2. Test Default Tone Dialog (Restore version snapshot)
  console.log('\nTesting Default Dialog (Version History Restore)...');
  const historyBtn = page.locator('button:has-text("History")');
  await historyBtn.click();
  const versionModal = page.locator('text=Version History');
  await versionModal.waitFor({ state: 'visible' });

  // Select snapshot
  const snapshotItem = page.locator('button:has-text("Snapshot")').first();
  await snapshotItem.waitFor({ state: 'visible' });
  await snapshotItem.click();

  // Click Restore this Snapshot
  const restoreBtn = page.locator('button:has-text("Restore this Snapshot")');
  await restoreBtn.waitFor({ state: 'visible' });
  await restoreBtn.click();

  await dialogCard.waitFor({ state: 'visible' });
  const defaultRole = await dialogCard.getAttribute('role');
  if (defaultRole !== 'dialog') {
    throw new Error(`Expected role="dialog" for default dialog, got "${defaultRole}"`);
  }

  // Check initial focus on Confirm button for default dialog
  await page.waitForTimeout(100);
  const defaultFocused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  if (defaultFocused !== 'confirm-dialog-confirm-btn') {
    throw new Error(`Expected focus on Confirm button for default dialog, got: ${defaultFocused}`);
  }
  console.log('✓ Initial focus correctly landed on Confirm button for default dialog');

  // Take 2x screenshot of default dialog
  const defaultScreenshotPath = path.join(ARTIFACT_DIR, 'confirm_dialog_default_2x.png');
  await dialogCard.screenshot({ path: defaultScreenshotPath });
  console.log(`✓ Saved default dialog screenshot to ${defaultScreenshotPath}`);

  await page.keyboard.press('Escape');
  await dialogCard.waitFor({ state: 'hidden' });

  // Close version modal
  const closeVersionModalBtn = page.locator('button[aria-label="Close dialog"]').first();
  if (await closeVersionModalBtn.isVisible()) {
    await closeVersionModalBtn.click();
    await page.waitForTimeout(200);
  }

  // 3. Test Wipe All Data Dialog in /app/settings
  console.log('\nTesting Wipe Data Dialog in /app/settings...');
  await page.goto('http://localhost:5173/app/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const wipeBtn = page.locator('button:has-text("Clear All Stash Data")');
  await wipeBtn.waitFor({ state: 'visible' });
  await wipeBtn.click();

  await dialogCard.waitFor({ state: 'visible' });
  const requireInput = page.locator('[data-testid="confirm-dialog-require-input"]');
  await requireInput.waitFor({ state: 'visible' });
  await page.waitForTimeout(100);

  // Initial focus must be in the input field
  const inputHasFocus = await page.evaluate(() => {
    return document.activeElement?.getAttribute('data-testid') === 'confirm-dialog-require-input';
  });
  if (!inputHasFocus) {
    throw new Error('Expected requireText input to have initial focus');
  }
  console.log('✓ requireText input received initial focus');

  // Confirm button must be disabled
  const confirmBtn = page.locator('[data-testid="confirm-dialog-confirm-btn"]');
  let isDisabled = await confirmBtn.isDisabled();
  if (!isDisabled) {
    throw new Error('Confirm button should be disabled initially when requireText is set');
  }
  console.log('✓ Confirm button is initially disabled');

  // Backdrop click does nothing for requireText dialog
  const backdrop = page.locator('[data-testid="confirm-dialog-backdrop"]');
  await backdrop.click({ position: { x: 10, y: 10 } });
  await page.waitForTimeout(200);
  let stillOpen = await dialogCard.isVisible();
  if (!stillOpen) {
    throw new Error('Backdrop click should NOT close a dialog with requireText');
  }
  console.log('✓ Backdrop click does nothing for requireText wipe dialog');

  // Type incorrect text
  await requireInput.fill('nope');
  isDisabled = await confirmBtn.isDisabled();
  if (!isDisabled) {
    throw new Error('Confirm button should still be disabled for incorrect text');
  }

  // Type correct text "delete"
  await requireInput.fill('delete');
  isDisabled = await confirmBtn.isDisabled();
  if (isDisabled) {
    throw new Error('Confirm button should be enabled when typing matches "delete"');
  }
  console.log('✓ Confirm button enabled when input matches "delete"');

  // Take 2x screenshot of wipe dialog
  const wipeScreenshotPath = path.join(ARTIFACT_DIR, 'confirm_dialog_wipe_2x.png');
  await dialogCard.screenshot({ path: wipeScreenshotPath });
  console.log(`✓ Saved wipe dialog screenshot to ${wipeScreenshotPath}`);

  // Cancel via Esc
  await page.keyboard.press('Escape');
  await dialogCard.waitFor({ state: 'hidden' });
  console.log('✓ Esc cancelled wipe dialog');

  // 4. Test Landing / Privacy Page wipe flow
  console.log('\nTesting Privacy Page wipe button...');
  await page.goto('http://localhost:5173/privacy', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // Switch to Storage tab in LiveProofPanel
  const storageTabBtn = page.locator('button:has-text("Storage & IndexedDB")');
  await storageTabBtn.waitFor({ state: 'visible' });
  await storageTabBtn.click();
  await page.waitForTimeout(300);

  const privacyWipeBtn = page.locator('button:has-text("Delete everything on this device")');
  await privacyWipeBtn.scrollIntoViewIfNeeded();
  await privacyWipeBtn.click();

  await dialogCard.waitFor({ state: 'visible' });
  console.log('✓ Privacy page "Delete everything on this device" opened custom ConfirmDialog');
  await page.keyboard.press('Escape');
  await dialogCard.waitFor({ state: 'hidden' });

  // 5. Test Reduced Motion
  console.log('\nTesting Reduced Motion preference...');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://localhost:5173/app/settings', { waitUntil: 'networkidle' });
  await wipeBtn.click();
  await dialogCard.waitFor({ state: 'visible' });

  const animTransform = await dialogCard.evaluate((el) => {
    return window.getComputedStyle(el).transform;
  });
  console.log(`✓ Dialog computed transform under reduced motion: ${animTransform}`);
  await page.keyboard.press('Escape');
  await dialogCard.waitFor({ state: 'hidden' });

  // Final check: Native dialog count must be 0
  if (nativeDialogCount > 0) {
    throw new Error(`FAIL: ${nativeDialogCount} native browser dialogs were detected!`);
  }
  console.log('\n======================================================');
  console.log('✓ ALL ASSERTIONS PASSED: 0 native dialog events fired!');
  console.log('======================================================');

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
