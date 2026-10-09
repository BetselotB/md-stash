import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

async function captureScenes() {
  console.log('=== CAPTURING HOW-IT-WORKS AT 4 VIEWPORTS ===\n');

  const outDir = path.resolve('public/qa-screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: '2560x1440', width: 2560, height: 1440 },
    { name: '1440x900',  width: 1440, height: 900 },
    { name: '768x1024',  width: 768,  height: 1024 },
    { name: '390x844',   width: 390,  height: 844 },
  ];

  for (const vp of viewports) {
    console.log(`Processing viewport ${vp.name}...`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Scroll to #how-it-works header
    await page.evaluate(() => {
      const el = document.querySelector('#how-it-works');
      el?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await page.waitForTimeout(600);

    // Capture header + Scene 1
    const p1 = path.join(outDir, `hiw-${vp.name}-scene1.png`);
    await page.screenshot({ path: p1, fullPage: false });
    console.log(`  Saved ${p1}`);

    // Scroll to Scene 2
    await page.evaluate(() => {
      const el = document.querySelectorAll('#how-it-works > div > div')[1];
      el?.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(600);

    const p2 = path.join(outDir, `hiw-${vp.name}-scene2.png`);
    await page.screenshot({ path: p2, fullPage: false });
    console.log(`  Saved ${p2}`);

    // Scroll to Scene 3
    await page.evaluate(() => {
      const el = document.querySelectorAll('#how-it-works > div > div')[2];
      el?.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(600);

    const p3 = path.join(outDir, `hiw-${vp.name}-scene3.png`);
    await page.screenshot({ path: p3, fullPage: false });
    console.log(`  Saved ${p3}`);

    await page.close();
  }

  await browser.close();
  console.log('\nAll scene screenshots captured!');
}

captureScenes().catch((err) => {
  console.error(err);
  process.exit(1);
});
