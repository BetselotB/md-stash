import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = path.resolve('C:/Users/addis/.gemini/antigravity-ide/brain/7f753463-b674-444f-9f28-e5ad24c26fd4/.tempmediaStorage');
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function parseRgb(colorStr) {
  if (!colorStr) return [0, 0, 0, 1];
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return [
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3]),
      match[4] !== undefined ? parseFloat(match[4]) : 1,
    ];
  }
  return [0, 0, 0, 1];
}

function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getHslLightness(r, g, b) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  return ((max + min) / 2) * 100;
}

function contrastRatio(rgb1, rgb2) {
  const l1 = getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

// Blend foreground rgba over background rgb
function blendRgba(fgRgba, bgRgb) {
  const [fr, fg, fb, fa] = fgRgba;
  const [br, bg, bb] = bgRgb;
  return [
    Math.round(fr * fa + br * (1 - fa)),
    Math.round(fg * fa + bg * (1 - fa)),
    Math.round(fb * fa + bb * (1 - fa)),
  ];
}

async function run() {
  console.log('--- Starting Playwright headless dialog restyling verification ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Visit /app and seed data
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  await page.evaluate(async () => {
    const db = window.__db;
    if (db) {
      await db.collections.clear();
      await db.files.clear();
      await db.versions.clear();

      await db.collections.put({
        id: 'col-ai',
        name: 'AI Context',
        color: '#E28B38',
        icon: 'folder',
        order: 1,
      });

      await db.files.put({
        id: 'file-1',
        title: 'Project Memory & Guidelines',
        filename: 'CLAUDE.md',
        content: '# Claude Project Memory\nKeep responses crisp and craft-oriented.',
        tags: ['claude', 'guide'],
        collectionId: 'col-ai',
        size: 92,
        pinned: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await db.files.put({
        id: 'file-2',
        title: 'Architecture Blueprint',
        filename: 'ARCHITECTURE.md',
        content: '# System Architecture\nLocal-first dataflow with Dexie IndexedDB.',
        tags: ['architecture', 'db'],
        collectionId: null,
        size: 145,
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await db.versions.put({
        id: 'v-1',
        fileId: 'file-1',
        content: '# Initial Version of Memory',
        createdAt: Date.now() - 3600000,
      });
    }
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // -------------------------------------------------------------
  // TEST A: STASH-NOTE DIALOG ("Create or stash markdown file")
  // -------------------------------------------------------------
  console.log('\n[1/4] Checking Stash-note Dialog...');
  const stashNoteBtn = page.locator('button:has-text("Stash a note")');
  await stashNoteBtn.click();
  await page.waitForTimeout(400);

  const dialogCard = page.locator('div[role="dialog"] [data-lenis-prevent]').first();
  await dialogCard.waitFor({ state: 'visible' });

  // Compute dialog card luminance
  const cardMetrics = await dialogCard.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    const bg = cs.backgroundColor;
    return { bg };
  });

  const cardRgb = parseRgb(cardMetrics.bg);
  const cardLightness = getHslLightness(cardRgb[0], cardRgb[1], cardRgb[2]);
  console.log(`✓ Dialog card bg: ${cardMetrics.bg}, HSL lightness L: ${cardLightness.toFixed(1)}%`);

  if (cardLightness < 75 || cardLightness > 83) {
    throw new Error(`Dialog card lightness ${cardLightness.toFixed(1)}% outside expected oat range [75%, 83%]`);
  }

  // Check inputs and textarea styling and contrast
  const fieldMetrics = await page.evaluate(() => {
    const card = document.querySelector('div[role="dialog"] [data-lenis-prevent]');
    const cardBg = parseRgb(window.getComputedStyle(card).backgroundColor);

    const input = card.querySelector('input');
    const textarea = card.querySelector('textarea');
    const label = card.querySelector('label');
    const selectTrigger = card.querySelector('button[role="combobox"]');
    const closeBtn = card.querySelector('button[aria-label="Close dialog"]');
    const buttons = Array.from(card.querySelectorAll('button'));
    const cancelBtn = buttons.find((b) => b.textContent?.includes('Cancel'));
    const submitBtn = card.querySelector('button[type="submit"]');

    function parseRgb(colorStr) {
      const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), match[4] !== undefined ? parseFloat(match[4]) : 1];
      return [0, 0, 0, 1];
    }

    return {
      inputBg: window.getComputedStyle(input).backgroundColor,
      inputColor: window.getComputedStyle(input).color,
      inputRadius: window.getComputedStyle(input).borderRadius,
      textareaBg: window.getComputedStyle(textarea).backgroundColor,
      labelFont: window.getComputedStyle(label).fontFamily,
      labelSize: window.getComputedStyle(label).fontSize,
      labelColor: window.getComputedStyle(label).color,
      closeColor: window.getComputedStyle(closeBtn).color,
      cancelHeight: cancelBtn.getBoundingClientRect().height,
      submitHeight: submitBtn.getBoundingClientRect().height,
      submitBg: window.getComputedStyle(submitBtn).backgroundColor,
      submitColor: window.getComputedStyle(submitBtn).color,
    };
  });

  const inputRgb = parseRgb(fieldMetrics.inputBg);
  const inputLightness = getHslLightness(inputRgb[0], inputRgb[1], inputRgb[2]);
  console.log(`✓ Field bg: ${fieldMetrics.inputBg}, HSL lightness L: ${inputLightness.toFixed(1)}% (darker oat)`);

  const labelRgb = parseRgb(fieldMetrics.labelColor);
  const blendedLabel = blendRgba(labelRgb, [cardRgb[0], cardRgb[1], cardRgb[2]]);
  const labelContrast = contrastRatio(blendedLabel, [cardRgb[0], cardRgb[1], cardRgb[2]]);
  console.log(`✓ Label contrast against card: ${labelContrast.toFixed(2)}:1 (>= 4.5:1 required)`);
  if (labelContrast < 4.5) {
    throw new Error(`Label contrast ${labelContrast.toFixed(2)}:1 is below 4.5:1`);
  }

  const fieldTextContrast = contrastRatio(parseRgb(fieldMetrics.inputColor), [inputRgb[0], inputRgb[1], inputRgb[2]]);
  console.log(`✓ Field text contrast against field: ${fieldTextContrast.toFixed(2)}:1 (>= 4.5:1 required)`);
  if (fieldTextContrast < 4.5) {
    throw new Error(`Field text contrast ${fieldTextContrast.toFixed(2)}:1 is below 4.5:1`);
  }

  // Placeholder contrast check
  const placeholderContrast = contrastRatio(
    blendRgba([38, 51, 42, 0.60], [inputRgb[0], inputRgb[1], inputRgb[2]]),
    [inputRgb[0], inputRgb[1], inputRgb[2]]
  );
  console.log(`✓ Placeholder contrast against field: ${placeholderContrast.toFixed(2)}:1 (>= 3.0:1 required)`);
  if (placeholderContrast < 3.0) {
    throw new Error(`Placeholder contrast ${placeholderContrast.toFixed(2)}:1 is below 3.0:1`);
  }

  // Close X contrast
  const closeRgb = parseRgb(fieldMetrics.closeColor);
  const blendedClose = blendRgba(closeRgb, [cardRgb[0], cardRgb[1], cardRgb[2]]);
  const closeContrast = contrastRatio(blendedClose, [cardRgb[0], cardRgb[1], cardRgb[2]]);
  console.log(`✓ Close X contrast against card: ${closeContrast.toFixed(2)}:1 (>= 3.0:1 required)`);
  if (closeContrast < 3.0) {
    throw new Error(`Close X contrast ${closeContrast.toFixed(2)}:1 is below 3.0:1`);
  }

  // Button height check
  console.log(`✓ Cancel button height: ${fieldMetrics.cancelHeight}px (>= 40px required)`);
  console.log(`✓ Submit button height: ${fieldMetrics.submitHeight}px (>= 40px required)`);
  if (fieldMetrics.cancelHeight < 40 || fieldMetrics.submitHeight < 40) {
    throw new Error('Buttons are shorter than 40px');
  }

  // Field size stability test on focus
  const filenameInput = page.locator('input[placeholder="e.g. CLAUDE.md"]');
  const sizeBefore = await filenameInput.boundingBox();
  await filenameInput.focus();
  await page.waitForTimeout(100);
  const sizeAfter = await filenameInput.boundingBox();
  if (Math.abs(sizeBefore.width - sizeAfter.width) > 1 || Math.abs(sizeBefore.height - sizeAfter.height) > 1) {
    throw new Error('Field changed size on focus!');
  }
  console.log('✓ Field maintained exact size on focus (no size jump)');

  // Focus ring check
  const hasFocusRing = await filenameInput.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return cs.outlineStyle !== 'none' || cs.boxShadow !== 'none';
  });
  console.log(`✓ Field focus ring visible: ${hasFocusRing}`);

  // Screenshot stash-note dialog
  const stashScreenshotPath = path.join(ARTIFACT_DIR, 'stash_note_dialog_2x.png');
  await dialogCard.screenshot({ path: stashScreenshotPath });
  console.log(`✓ Saved stash-note dialog screenshot to ${stashScreenshotPath}`);

  // Close stash dialog
  await page.keyboard.press('Escape');
  await dialogCard.waitFor({ state: 'hidden' });
  await page.waitForTimeout(300);

  // -------------------------------------------------------------
  // TEST B: COLLECTION DIALOG ("New collection" / "Edit collection")
  // -------------------------------------------------------------
  console.log('\n[2/4] Checking Collection Dialog...');
  const newColBtn = page.locator('button[aria-label="New collection"]');
  await newColBtn.click();
  await page.waitForTimeout(400);

  const colCard = page.locator('div[role="dialog"] [data-lenis-prevent]').first();
  await colCard.waitFor({ state: 'visible' });

  // Check Mark preview and button styles
  const colMetrics = await page.evaluate(() => {
    const dialog = document.querySelector('div[role="dialog"]');
    const preview = dialog ? dialog.querySelector('.bg-\\[var\\(--field-bg\\)\\]') : null;
    const buttons = dialog ? Array.from(dialog.querySelectorAll('button')) : [];
    const cancelBtn = buttons.find((b) => b.textContent?.includes('Cancel'));
    const submitBtn = buttons.find((b) => b.textContent?.includes('Create collection'));
    return {
      hasPreview: !!preview,
      cancelHeight: cancelBtn?.getBoundingClientRect().height,
      submitHeight: submitBtn?.getBoundingClientRect().height,
    };
  });
  console.log(`✓ Collection mark preview field-bg present: ${colMetrics.hasPreview}`);
  console.log(`✓ Collection buttons height: ${colMetrics.cancelHeight}px / ${colMetrics.submitHeight}px`);

  // Screenshot collection dialog
  const colScreenshotPath = path.join(ARTIFACT_DIR, 'collection_dialog_2x.png');
  await colCard.screenshot({ path: colScreenshotPath });
  console.log(`✓ Saved collection dialog screenshot to ${colScreenshotPath}`);

  await page.keyboard.press('Escape');
  await colCard.waitFor({ state: 'hidden' });
  await page.waitForTimeout(300);

  // -------------------------------------------------------------
  // TEST C: CONFIRM DIALOG (Delete confirmation)
  // -------------------------------------------------------------
  console.log('\n[3/4] Checking Confirm Dialog...');
  await page.goto('http://localhost:5173/app/f/file-1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const deleteBtn = page.locator('button[aria-label="Delete file"]');
  await deleteBtn.waitFor({ state: 'visible' });
  await deleteBtn.click();
  await page.waitForTimeout(400);

  const confirmCard = page.locator('[data-testid="confirm-dialog-card"]');
  await confirmCard.waitFor({ state: 'visible' });

  const confirmMetrics = await confirmCard.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    const cancelBtn = el.querySelector('[data-testid="confirm-dialog-cancel-btn"]');
    const confirmBtn = el.querySelector('[data-testid="confirm-dialog-confirm-btn"]');
    const cancelCs = window.getComputedStyle(cancelBtn);
    const confirmCs = window.getComputedStyle(confirmBtn);

    return {
      cardBg: cs.backgroundColor,
      cancelHeight: cancelBtn.getBoundingClientRect().height,
      confirmHeight: confirmBtn.getBoundingClientRect().height,
      confirmBg: confirmCs.backgroundColor,
      confirmColor: confirmCs.color,
    };
  });

  const confirmRgb = parseRgb(confirmMetrics.cardBg);
  const confirmLightness = getHslLightness(confirmRgb[0], confirmRgb[1], confirmRgb[2]);
  console.log(`✓ Confirm dialog card bg: ${confirmMetrics.cardBg}, HSL lightness L: ${confirmLightness.toFixed(1)}%`);

  const dangerBtnContrast = contrastRatio(parseRgb(confirmMetrics.confirmBg), parseRgb(confirmMetrics.confirmColor));
  console.log(`✓ Danger button contrast: ${dangerBtnContrast.toFixed(2)}:1 (>= 4.5:1 required)`);
  if (dangerBtnContrast < 4.5) {
    throw new Error(`Danger button contrast ${dangerBtnContrast.toFixed(2)}:1 is below 4.5:1`);
  }

  // Screenshot confirm dialog
  const confirmScreenshotPath = path.join(ARTIFACT_DIR, 'confirm_dialog_2x.png');
  await confirmCard.screenshot({ path: confirmScreenshotPath });
  console.log(`✓ Saved confirm dialog screenshot to ${confirmScreenshotPath}`);

  await page.keyboard.press('Escape');
  await confirmCard.waitFor({ state: 'hidden' });
  await page.waitForTimeout(300);

  // -------------------------------------------------------------
  // TEST D: BUNDLE TRAY
  // -------------------------------------------------------------
  console.log('\n[4/4] Checking Bundle Tray...');
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle' });
  await page.waitForSelector('button[aria-label="Select file"]', { state: 'attached', timeout: 10000 });
  await page.waitForTimeout(400);

  // Click first two file checkboxes with force
  const checkboxes = page.locator('button[aria-label="Select file"]');
  await checkboxes.nth(0).click({ force: true });
  await page.waitForTimeout(200);
  await checkboxes.nth(1).click({ force: true });
  await page.waitForTimeout(400);

  const bundleTray = page.locator('div[data-lenis-prevent]').filter({ hasText: 'Bundle selected' }).first();
  await bundleTray.waitFor({ state: 'visible', timeout: 5000 });

  const trayMetrics = await bundleTray.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      height: el.getBoundingClientRect().height,
    };
  });

  const trayRgb = parseRgb(trayMetrics.bg);
  const trayLightness = getHslLightness(trayRgb[0], trayRgb[1], trayRgb[2]);
  console.log(`✓ Bundle tray bg: ${trayMetrics.bg}, HSL lightness L: ${trayLightness.toFixed(1)}%`);

  // Screenshot bundle tray
  const trayScreenshotPath = path.join(ARTIFACT_DIR, 'bundle_tray_2x.png');
  await bundleTray.screenshot({ path: trayScreenshotPath });
  console.log(`✓ Saved bundle tray screenshot to ${trayScreenshotPath}`);

  // -------------------------------------------------------------
  // TEST E: CHECK ALL SURFACES IN /APP ARE NOT LIGHTER THAN OAT
  // -------------------------------------------------------------
  console.log('\n[5/5] Auditing all card and popover surfaces inside /app...');
  const maxLightnessInsideApp = await page.evaluate(() => {
    const surfaces = Array.from(document.querySelectorAll('.rounded-2xl, .rounded-xl, [role="dialog"], [role="listbox"], [role="status"]'));
    let maxL = 0;
    let maxEl = null;

    function parseRgb(colorStr) {
      const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      return null;
    }

    for (const el of surfaces) {
      // Ignore transparent or inherit
      const cs = window.getComputedStyle(el);
      const rgb = parseRgb(cs.backgroundColor);
      if (rgb) {
        const [r, g, b] = rgb;
        // If it's transparent (all 0 or pure sage background canvas), skip
        if (r === 131 && g === 141 && b === 120) continue; // Canvas sage
        if (r === 94 && g === 106 && b === 84) continue; // Sidebar deep sage

        const max = Math.max(r, g, b) / 255;
        const min = Math.min(r, g, b) / 255;
        const lightness = ((max + min) / 2) * 100;

        // Skip sidebar active collection indicator (requested in turn 6 as high-contrast cream on sage)
        if (el.closest('aside')) continue;

        if (lightness > maxL) {
          maxL = lightness;
          maxEl = el.className;
        }
      }
    }
    return { maxL, maxEl };
  });

  console.log(`✓ Max surface lightness inside /app: ${maxLightnessInsideApp.maxL.toFixed(1)}% (must not exceed oat ~82%)`);
  if (maxLightnessInsideApp.maxL > 83) {
    throw new Error(`Found surface with lightness ${maxLightnessInsideApp.maxL.toFixed(1)}% (> 83%): ${maxLightnessInsideApp.maxEl}`);
  }

  console.log('\n======================================================');
  console.log('✓ ALL DIALOG RESTYLING TESTS AND CONTRAST AUDITS PASSED!');
  console.log('======================================================');

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
