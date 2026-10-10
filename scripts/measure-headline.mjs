import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const viewports = [1024, 1440, 1920, 2560];

  for (const w of viewports) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto('http://localhost:5173/privacy');
    await page.waitForSelector('h1');

    const data = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const h1Rect = h1.getBoundingClientRect();
      const container = h1.parentElement.getBoundingClientRect();
      // Also get the bounding rect of the first line text ("Your files")
      const textNode = h1.firstChild;
      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, 10);
      const textRect = range.getBoundingClientRect();

      return {
        h1Rect: { left: h1Rect.left, right: h1Rect.right, top: h1Rect.top, bottom: h1Rect.bottom, width: h1Rect.width },
        textRect: { left: textRect.left, right: textRect.right, top: textRect.top, bottom: textRect.bottom },
        container: { left: container.left, right: container.right, top: container.top, bottom: container.bottom, width: container.width },
      };
    });

    console.log(`Viewport ${w}px:`, JSON.stringify(data, null, 2));
    await page.close();
  }

  await browser.close();
}

main().catch(console.error);
