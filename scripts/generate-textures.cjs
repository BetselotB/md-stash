const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const texturesDir = path.resolve(__dirname, '../public/textures');
  if (!fs.existsSync(texturesDir)) {
    fs.mkdirSync(texturesDir, { recursive: true });
  }

  // 1. Fine grain: 256x256, baseFrequency 0.85, numOctaves 2, stitchTiles stitch
  const fineSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
      <filter id="fine" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="noise" />
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
      </filter>
      <rect width="256" height="256" filter="url(#fine)" />
    </svg>
  `;

  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:transparent;">${fineSvg}</body></html>`);
  const fineSvgEl = await page.$('svg');
  if (fineSvgEl) {
    await fineSvgEl.screenshot({ path: path.join(texturesDir, 'grain-fine.png') });
  }

  // 2. Coarse mottling: 1024x1024, baseFrequency 0.018, numOctaves 4, stitchTiles stitch
  const coarseSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
      <filter id="coarse" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" stitchTiles="stitch" result="noise" />
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
      </filter>
      <rect width="1024" height="1024" filter="url(#coarse)" />
    </svg>
  `;

  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:transparent;">${coarseSvg}</body></html>`);
  const coarseSvgEl = await page.$('svg');
  if (coarseSvgEl) {
    await coarseSvgEl.screenshot({ path: path.join(texturesDir, 'grain-coarse.png') });
  }

  await browser.close();
  console.log('Textures generated successfully in public/textures/');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
