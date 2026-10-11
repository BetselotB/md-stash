import { chromium } from 'playwright';

async function run() {
  console.log('Testing Privacy page title...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173/privacy', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const title = await page.title();
  console.log('Page title on /privacy:', JSON.stringify(title));

  if (title !== 'MDstash | Privacy') {
    throw new Error(`Expected title "MDstash | Privacy" but got: "${title}"`);
  }

  await browser.close();
  console.log('Privacy page title verified successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
