const { chromium } = require('playwright');
const path = require('path');

async function capture() {
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: '2560x1440', width: 2560, height: 1440 },
    { name: '1920x1080', width: 1920, height: 1080 },
    { name: '1440x900', width: 1440, height: 900 },
    { name: '390x844', width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Hero screenshot
    await page.screenshot({ path: `qa_${vp.name}_hero.png` });

    // Scrolled screenshot to test cream transition and nav color flip
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa_${vp.name}_cream.png` });

    if (vp.name === '390x844') {
      // Test mobile menu overlay
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      const menuBtn = page.getByRole('button', { name: /open menu/i });
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: `qa_${vp.name}_menu.png` });
      }
    }

    await page.close();
  }

  await browser.close();
  console.log('All QA screenshots captured successfully.');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
