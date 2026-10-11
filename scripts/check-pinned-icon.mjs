import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/addis/.gemini/antigravity-ide/brain/7f753463-b674-444f-9f28-e5ad24c26fd4/.tempmediaStorage';
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function run() {
  console.log('Testing Sidebar Pinned Icon styling...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Locate the navigation section in the sidebar
  const navSection = page.locator('aside nav, aside .space-y-1').first();
  await navSection.waitFor({ state: 'visible' });

  // Get icons for All files, Pinned, and Unsorted
  const allFilesIcon = page.locator('a[href="/app"] svg').first();
  const pinnedIcon = page.locator('a[href="/app?filter=pinned"] svg').first();
  const unsortedIcon = page.locator('a[href="/app/c/unsorted"] svg').first();

  const iconInfo = await page.evaluate(() => {
    const allSvg = document.querySelector('a[href="/app"] svg');
    const pinnedSvg = document.querySelector('a[href="/app?filter=pinned"] svg');
    const unsortedSvg = document.querySelector('a[href="/app/c/unsorted"] svg');

    return {
      allFiles: {
        fill: window.getComputedStyle(allSvg).fill,
        stroke: window.getComputedStyle(allSvg).stroke,
        color: window.getComputedStyle(allSvg).color,
        className: allSvg?.getAttribute('class'),
      },
      pinned: {
        fill: window.getComputedStyle(pinnedSvg).fill,
        stroke: window.getComputedStyle(pinnedSvg).stroke,
        color: window.getComputedStyle(pinnedSvg).color,
        className: pinnedSvg?.getAttribute('class'),
      },
      unsorted: {
        fill: window.getComputedStyle(unsortedSvg).fill,
        stroke: window.getComputedStyle(unsortedSvg).stroke,
        color: window.getComputedStyle(unsortedSvg).color,
        className: unsortedSvg?.getAttribute('class'),
      },
    };
  });

  console.log('Icon info:', iconInfo);

  // Assert hollow (fill is none)
  if (iconInfo.pinned.fill !== 'none') {
    throw new Error(`Pinned icon is not hollow! fill: ${iconInfo.pinned.fill}`);
  }

  // Assert class doesn't have fill-orange
  if (iconInfo.pinned.className?.includes('fill-orange')) {
    throw new Error('Pinned icon still has fill-orange class!');
  }

  // Take screenshot of the sidebar
  const sidebar = page.locator('aside').first();
  const screenshotPath = path.join(ARTIFACT_DIR, 'sidebar_pinned_hollow.png');
  await sidebar.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  await browser.close();
  console.log('Sidebar Pinned Icon verification successful!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
