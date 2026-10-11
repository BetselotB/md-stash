import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/addis/.gemini/antigravity-ide/brain/7f753463-b674-444f-9f28-e5ad24c26fd4/.tempmediaStorage';
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function run() {
  console.log('Testing Modal Backdrop Coverage...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Seed collection "AI Context" and files via window.__db
  await page.evaluate(async () => {
    const db = window.__db;
    if (db) {
      await db.collections.clear();
      await db.files.clear();
      await db.collections.put({
        id: 'col-ai',
        name: 'AI Context',
        color: '#E28B38',
        icon: 'folder',
        order: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      await db.files.put({
        id: 'file-1',
        title: 'Claude Project Memory & Rules',
        filename: 'CLAUDE.md',
        content: '# Claude Rules',
        size: 1024,
        collectionId: 'col-ai',
        tags: ['claude'],
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  });

  await page.goto('http://localhost:5173/app/c/col-ai', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Click edit collection button in main header
  const editBtn = page.locator('main button[title="Edit collection"]');
  await editBtn.waitFor({ state: 'visible' });
  await editBtn.click();
  await page.waitForTimeout(400);

  // Verify dialog is visible
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor({ state: 'visible' });

  // Get bounding box of dialog backdrop
  const backdropBox = await dialog.boundingBox();
  console.log('Dialog backdrop bounding box:', backdropBox);

  if (backdropBox.y !== 0) {
    throw new Error(`Backdrop y is not 0! Received: ${backdropBox.y}`);
  }
  if (backdropBox.height < 900) {
    throw new Error(`Backdrop does not cover full viewport height! Received height: ${backdropBox.height}`);
  }

  // Check elementFromPoint at the top bar area (x=600, y=30)
  const topCoveredElement = await page.evaluate(() => {
    const el = document.elementFromPoint(600, 30);
    return {
      tagName: el?.tagName,
      role: el?.getAttribute('role'),
      className: el?.className,
    };
  });
  console.log('Element at (600, 30) Topbar position:', topCoveredElement);

  if (topCoveredElement.role !== 'dialog' && !topCoveredElement.className?.includes('fixed')) {
    throw new Error('Top bar area is NOT covered by dialog backdrop!');
  }

  // Also check top-left (sidebar logo area x=50, y=30)
  const sidebarCoveredElement = await page.evaluate(() => {
    const el = document.elementFromPoint(50, 30);
    return {
      tagName: el?.tagName,
      role: el?.getAttribute('role'),
      className: el?.className,
    };
  });
  console.log('Element at (50, 30) Sidebar logo position:', sidebarCoveredElement);

  if (sidebarCoveredElement.role !== 'dialog' && !sidebarCoveredElement.className?.includes('fixed')) {
    throw new Error('Sidebar area is NOT covered by dialog backdrop!');
  }

  // Take screenshot of the entire window with modal open
  const screenshotPath = path.join(ARTIFACT_DIR, 'collection_modal_backdrop_full.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  await browser.close();
  console.log('Modal backdrop coverage successfully verified!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
