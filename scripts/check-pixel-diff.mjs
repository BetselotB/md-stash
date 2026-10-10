import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { chromium } from 'playwright';

async function captureScreenshots(viewport, captureDir) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });

  await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  const sectionBounds = await page.evaluate(() => {
    const getTop = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    };
    return {
      curtain: getTop('#cream-curtain') || 800,
      howItWorks: getTop('#how-it-works') || 1200,
      features: getTop('#features') || 2800,
      playground: getTop('#playground') || 4200,
    };
  });

  const shots = [
    { name: `hero-${viewport.width}`, y: 0 },
    { name: `curtain-${viewport.width}`, y: sectionBounds.curtain },
    { name: `scene1-${viewport.width}`, y: sectionBounds.howItWorks },
    { name: `scene2-${viewport.width}`, y: sectionBounds.howItWorks + 600 },
    { name: `scene3-${viewport.width}`, y: sectionBounds.howItWorks + 1200 },
    { name: `features-${viewport.width}`, y: sectionBounds.features },
    { name: `playground-${viewport.width}`, y: sectionBounds.playground },
  ];

  for (const s of shots) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), s.y);
    await page.waitForTimeout(400);
    const filePath = path.join(captureDir, `${s.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
  }

  // Nav in sage state (y=0) and cream state (y=curtain + 200)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(captureDir, `nav-sage-${viewport.width}.png`) });

  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), sectionBounds.curtain + 200);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(captureDir, `nav-cream-${viewport.width}.png`) });

  await browser.close();
}

async function main() {
  const beforeDir = path.resolve('scripts/out/perf-before');
  const currentDir = path.resolve('scripts/out/perf-current');
  const diffDir = path.resolve('scripts/out/perf-diffs');
  fs.mkdirSync(currentDir, { recursive: true });
  fs.mkdirSync(diffDir, { recursive: true });

  console.log('Capturing current screenshots for comparison...');
  await captureScreenshots({ width: 1440, height: 900 }, currentDir);
  await captureScreenshots({ width: 2560, height: 1440 }, currentDir);

  const files = fs.readdirSync(beforeDir).filter((f) => f.endsWith('.png'));
  console.log(`\nComparing ${files.length} screenshots against baseline using pixelmatch...`);

  let maxDiffPct = 0;
  let hasFailure = false;

  for (const file of files) {
    const beforeFile = path.join(beforeDir, file);
    const curFile = path.join(currentDir, file);
    const diffFile = path.join(diffDir, file);

    if (!fs.existsSync(curFile)) {
      console.warn(`  Missing current screenshot for ${file}`);
      continue;
    }

    const img1 = PNG.sync.read(fs.readFileSync(beforeFile));
    const img2 = PNG.sync.read(fs.readFileSync(curFile));

    if (img1.width !== img2.width || img1.height !== img2.height) {
      console.error(`  DIMENSION MISMATCH for ${file}: before=${img1.width}x${img1.height}, cur=${img2.width}x${img2.height}`);
      hasFailure = true;
      continue;
    }

    const { width, height } = img1;
    const diff = new PNG({ width, height });
    const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
    const totalPixels = width * height;
    const diffPct = (diffPixels / totalPixels) * 100;

    if (diffPct > maxDiffPct) maxDiffPct = diffPct;

    fs.writeFileSync(diffFile, PNG.sync.write(diff));

    // Threshold: 0.5% visual tolerance (due to subpixel text/antialiasing)
    const passed = diffPct <= 0.5;
    console.log(`  ${file.padEnd(24)}: ${diffPct.toFixed(3)}% diff (${diffPixels} px) -> ${passed ? 'PASS' : 'WARN/FAIL'}`);
    if (!passed) {
      hasFailure = true;
    }
  }

  console.log(`\nMax diff across all screenshots: ${maxDiffPct.toFixed(3)}%`);
  if (hasFailure) {
    console.error('Some screenshots exceeded 0.5% diff tolerance!');
    process.exit(1);
  } else {
    console.log('ALL SCREENSHOTS WITHIN TOLERANCE (<0.5%)!');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
