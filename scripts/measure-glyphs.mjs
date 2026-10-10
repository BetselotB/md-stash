import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  for (const w of [1024, 1440, 1920, 2560]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto('http://localhost:5173/privacy');
    await page.waitForSelector('h1');

    const maxTextX = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      // Get all child elements and ranges
      const rects = [];
      const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) {
          rects.push(r);
        }
      }
      return {
        maxX: Math.max(...rects.map(r => r.right)),
        minX: Math.min(...rects.map(r => r.left)),
        minY: Math.min(...rects.map(r => r.top)),
        maxY: Math.max(...rects.map(r => r.bottom)),
      };
    });

    console.log(`Viewport ${w}px text bounding box:`, maxTextX);
    await page.close();
  }
  await browser.close();
}

main().catch(console.error);
