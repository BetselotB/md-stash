import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/addis/.gemini/antigravity-ide/brain/7f753463-b674-444f-9f28-e5ad24c26fd4/.tempmediaStorage';
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function run() {
  console.log('Verifying Privacy page footer...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173/privacy', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Scroll to footer
  const footer = page.locator('footer');
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Verify elements in footer
  const stashWordmark = footer.locator('span.font-display.text-\\[19vw\\]');
  await stashWordmark.waitFor({ state: 'visible' });

  const wordmarkHtml = await stashWordmark.innerHTML();
  console.log('Wordmark innerHTML:', wordmarkHtml);

  if (!wordmarkHtml.includes('text-orange')) {
    throw new Error('Wordmark missing orange "stash" span!');
  }

  const wordmarkOpacity = await stashWordmark.evaluate((el) => {
    return window.getComputedStyle(el).opacity;
  });
  console.log('Wordmark opacity:', wordmarkOpacity);
  if (parseFloat(wordmarkOpacity) < 0.95) {
    throw new Error(`Wordmark opacity too low: ${wordmarkOpacity}`);
  }

  // Check orange span inside wordmark
  const orangeSpan = stashWordmark.locator('span.text-orange');
  const orangeColor = await orangeSpan.evaluate((el) => window.getComputedStyle(el).color);
  console.log('Orange span color:', orangeColor);

  const screenshotPath = path.join(ARTIFACT_DIR, 'privacy_footer_verified.png');
  await footer.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  await browser.close();
  console.log('Privacy footer verified successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
