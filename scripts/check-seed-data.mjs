import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/addis/.gemini/antigravity-ide/brain/7f753463-b674-444f-9f28-e5ad24c26fd4/.tempmediaStorage';
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function run() {
  console.log('Testing fresh initial load seed data...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Clear any existing IndexedDB database to simulate opening for the first time
  await page.evaluate(async () => {
    const db = window.__db;
    if (db) {
      await db.files.clear();
      await db.collections.clear();
      await db.versions.clear();
    }
  });

  // Reload to trigger seedInitialDataIfNeeded on fresh DB
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check files in the database
  const files = await page.evaluate(async () => {
    const db = window.__db;
    if (!db) return [];
    return await db.files.toArray();
  });

  console.log('Files count in DB:', files.length);
  console.log('Files in DB:', files);

  // Check visible elements on the page
  const pageState = await page.evaluate(() => {
    return {
      hasDashedArch: !!document.querySelector('svg linearGradient#emptyArchGrad'),
      testIds: Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid')),
      cardElements: document.querySelectorAll('.bg-\\[\\#D8D3BC\\]').length,
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(el => el.innerText),
    };
  });
  console.log('Page state:', pageState);

  const screenshotPath = path.join(ARTIFACT_DIR, 'app_first_load_single_card.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
