import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/addis/.gemini/antigravity-ide/brain/7f753463-b674-444f-9f28-e5ad24c26fd4/.tempmediaStorage';
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function run() {
  console.log('Testing FileDetail header layout and checking overlap...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173/app');
  await page.waitForLoadState('networkidle');

  // Seed sample file
  await page.evaluate(async () => {
    const req = indexedDB.open('MDstashDB');
    await new Promise((resolve, reject) => {
      req.onsuccess = async (e) => {
        const db = e.target.result;
        try {
          const tx = db.transaction(['files'], 'readwrite');
          const store = tx.objectStore('files');
          const file = {
            id: 'file-design-websites',
            title: 'Design webistes',
            filename: 'Design webistes.txt',
            content: 'https://pro.reactbits.dev/docs/components/dolly-gallery\n\nhttps://animate-ui.com/docs/icons?search=',
            size: 280,
            collectionId: null,
            tags: ['rules'],
            pinned: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          store.put(file);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        } catch (err) {
          reject(err);
        }
      };
      req.onerror = () => reject(req.error);
    });
  });

  await page.goto('http://localhost:5173/app/f/file-design-websites', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Locate the header container
  const header = page.locator('.bg-forest .border-b.border-line').first();
  await header.waitFor({ state: 'visible' });

  // Locate copy split button and metadata text
  const copyBtn = page.locator('button:has-text("Copy prompt")').first();
  const metadataEl = page.locator('div.text-xs.font-mono').first();

  const copyBox = await copyBtn.boundingBox();
  const metaBox = await metadataEl.boundingBox();
  const metaText = await metadataEl.innerText();

  console.log('Metadata text:', JSON.stringify(metaText));
  console.log('Copy button bounding box:', copyBox);
  console.log('Metadata bounding box:', metaBox);

  // Check overlap
  const overlapsX = Math.max(0, Math.min(copyBox.x + copyBox.width, metaBox.x + metaBox.width) - Math.max(copyBox.x, metaBox.x));
  const overlapsY = Math.max(0, Math.min(copyBox.y + copyBox.height, metaBox.y + metaBox.height) - Math.max(copyBox.y, metaBox.y));
  const isOverlapping = overlapsX > 0 && overlapsY > 0;

  console.log('Is overlapping:', isOverlapping);
  if (isOverlapping) {
    throw new Error('Copy prompt button is still overlapping the metadata text!');
  }

  if (metaText.includes('Updated')) {
    throw new Error('Updated time is still present in metadata text!');
  }

  const screenshotPath = path.join(ARTIFACT_DIR, 'file_detail_header_fixed.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  await browser.close();
  console.log('FileDetail header layout verified successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
