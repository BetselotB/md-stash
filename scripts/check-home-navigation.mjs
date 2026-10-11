import { chromium } from 'playwright';

async function run() {
  console.log('Testing Home navigation from /privacy...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Navigate to /privacy
  await page.goto('http://localhost:5173/privacy', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  if (!page.url().includes('/privacy')) {
    throw new Error(`Expected /privacy, but got ${page.url()}`);
  }

  // 2. Click Home link
  const homeLink = page.locator('nav a:has-text("Home")').first();
  await homeLink.waitFor({ state: 'visible' });
  await homeLink.click();
  await page.waitForTimeout(500);

  // 3. Verify URL is now landing page "/"
  const currentUrl = page.url();
  console.log('URL after clicking Home on /privacy:', currentUrl);

  const parsedUrl = new URL(currentUrl);
  if (parsedUrl.pathname !== '/') {
    throw new Error(`Expected pathname "/", but got "${parsedUrl.pathname}"`);
  }

  // 4. Verify landing page content is present
  const heroHeading = page.locator('h1, h2:has-text("Stash")').first();
  await heroHeading.waitFor({ state: 'visible' });

  // 5. Click Home again on "/" to ensure it does not break or navigate away
  await homeLink.click();
  await page.waitForTimeout(300);
  const secondUrl = new URL(page.url());
  if (secondUrl.pathname !== '/') {
    throw new Error(`Expected pathname "/", but got "${secondUrl.pathname}"`);
  }

  await browser.close();
  console.log('Home navigation from /privacy verified successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
