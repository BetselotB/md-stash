import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import { chromium } from 'playwright';

async function checkLook() {
  console.log('--- MDstash Look & Feel Texture Verification ---');

  // 1. Reference baseline values (measured from reference/brewdistrict-hero.png)
  const REF_SAGE = { r: 131, g: 141, b: 120 };
  const REF_LUM_STD = 2.31; // tactile tooth standard deviation

  // 2. Launch headless browser
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2560, height: 1440 } });
  
  const url = process.argv[2] || 'http://localhost:5173/?nointro';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600); // allow fonts and layout to settle

  const screenshotBuffer = await page.screenshot({ fullPage: false });
  await browser.close();

  const img = PNG.sync.read(screenshotBuffer);
  console.log(`Rendered screenshot size: ${img.width}x${img.height}`);

  // 3. Sample empty sage background patch:
  // e.g. mid-left region [x=150, y=600, w=150, h=150] (well clear of nav, badge, crate, and text)
  const sx = 150;
  const sy = 600;
  const sw = 150;
  const sh = 150;

  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  const lums = [];
  const patchGrid = [];

  for (let y = 0; y < sh; y++) {
    patchGrid[y] = [];
    for (let x = 0; x < sw; x++) {
      const px = sx + x;
      const py = sy + y;
      const idx = (img.width * py + px) * 4;
      const r = img.data[idx];
      const g = img.data[idx + 1];
      const b = img.data[idx + 2];
      rSum += r;
      gSum += g;
      bSum += b;
      count++;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      lums.push(lum);
      patchGrid[y][x] = lum;
    }
  }

  const rAvg = Math.round(rSum / count);
  const gAvg = Math.round(gSum / count);
  const bAvg = Math.round(bSum / count);
  const lumMean = lums.reduce((a, b) => a + b, 0) / count;
  const lumVar = lums.reduce((a, b) => a + (b - lumMean) ** 2, 0) / count;
  const lumStd = Math.sqrt(lumVar);

  // 4. Low-frequency variance (40px box blur)
  const radius = 20; // 41x41 window
  const blurred = [];
  for (let y = radius; y < sh - radius; y++) {
    for (let x = radius; x < sw - radius; x++) {
      let bSumVal = 0, bCnt = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          bSumVal += patchGrid[y + dy][x + dx];
          bCnt++;
        }
      }
      blurred.push(bSumVal / bCnt);
    }
  }

  const blurMean = blurred.reduce((a, b) => a + b, 0) / blurred.length;
  const blurVar = blurred.reduce((a, b) => a + (b - blurMean) ** 2, 0) / blurred.length;
  const lowFreqStd = Math.sqrt(blurVar);

  const diffR = Math.abs(rAvg - REF_SAGE.r);
  const diffG = Math.abs(gAvg - REF_SAGE.g);
  const diffB = Math.abs(bAvg - REF_SAGE.b);
  const stdDiffPercent = Math.abs((lumStd - REF_LUM_STD) / REF_LUM_STD) * 100;

  console.log(`\n--- Verification Results ---`);
  console.log(`Rendered Sage Patch: rgb(${rAvg}, ${gAvg}, ${bAvg}) | Ref: rgb(${REF_SAGE.r}, ${REF_SAGE.g}, ${REF_SAGE.b})`);
  console.log(`Channel Delta: ΔR=${diffR}, ΔG=${diffG}, ΔB=${diffB} (Limit: <= 3 per channel)`);
  console.log(`Luminance StdDev (Tactile Tooth): ${lumStd.toFixed(2)} | Ref: ${REF_LUM_STD.toFixed(2)} (Delta: ${stdDiffPercent.toFixed(1)}%, Limit: <= 25%)`);
  console.log(`Low-Frequency Variance (40px blur StdDev): ${lowFreqStd.toFixed(3)} (Limit: < 1.5, proves no clouds/vignette)`);

  let passed = true;
  if (diffR > 3 || diffG > 3 || diffB > 3) {
    console.error(`FAIL: Channel delta exceeds 3 levels!`);
    passed = false;
  }
  if (stdDiffPercent > 25) {
    console.error(`FAIL: Luminance StdDev delta exceeds 25%!`);
    passed = false;
  }
  if (lowFreqStd >= 1.5) {
    console.error(`FAIL: Low-frequency variance >= 1.5 (cloudy mottling or vignette detected)!`);
    passed = false;
  }

  if (passed) {
    console.log(`\nALL LOOK CHECKS PASSED SUCCESSFULLY!`);
    process.exit(0);
  } else {
    process.exit(1);
  }
}

checkLook().catch(err => {
  console.error(err);
  process.exit(1);
});
