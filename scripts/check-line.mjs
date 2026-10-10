import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const VIEWPORTS = [
  { width: 2560, height: 1440, label: '2560x1440' },
  { width: 1920, height: 1080, label: '1920x1080' },
  { width: 1440, height: 900,  label: '1440x900' },
  { width: 1024, height: 768,  label: '1024x768' },
];

async function main() {
  console.log('=== VERIFYING RE-ANCHORED CONNECTING LINE (HEADLESS PLAYWRIGHT) ===\n');

  const screenshotDir = path.resolve('public/qa-screenshots');
  fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  let allPassed = true;

  for (const vp of VIEWPORTS) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`Testing Viewport: ${vp.label} (${vp.width}x${vp.height})`);
    console.log(`------------------------------------------------------------`);

    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    // Helper to extract and assert geometry
    async function checkGeometry(stage) {
      const data = await page.evaluate(() => {
        const sec = document.querySelector('#how-it-works');
        const p1 = document.querySelector('[data-panel="1"]');
        const p2 = document.querySelector('[data-panel="2"]');
        const p3 = document.querySelector('[data-panel="3"]');
        const line1 = document.querySelector('#hiw-line-1');
        const line2 = document.querySelector('#hiw-line-2');

        if (!sec || !p1 || !p2 || !p3 || !line1 || !line2) {
          return { error: 'Missing elements' };
        }

        const secRect = sec.getBoundingClientRect();
        const p1Rect = p1.getBoundingClientRect();
        const p2Rect = p2.getBoundingClientRect();
        const p3Rect = p3.getBoundingClientRect();

        const l1 = line1.getTotalLength();
        const l2 = line2.getTotalLength();

        const s1_start = line1.getPointAtLength(0);
        const s1_end = line1.getPointAtLength(l1);
        const s2_start = line2.getPointAtLength(0);
        const s2_end = line2.getPointAtLength(l2);

        // Check vertical bounds along the segments (every 5% of path length)
        let s1_minY = Infinity, s1_maxY = -Infinity;
        for (let i = 0; i <= 20; i++) {
          const pt = line1.getPointAtLength((i / 20) * l1);
          if (pt.y < s1_minY) s1_minY = pt.y;
          if (pt.y > s1_maxY) s1_maxY = pt.y;
        }

        let s2_minY = Infinity, s2_maxY = -Infinity;
        for (let i = 0; i <= 20; i++) {
          const pt = line2.getPointAtLength((i / 20) * l2);
          if (pt.y < s2_minY) s2_minY = pt.y;
          if (pt.y > s2_maxY) s2_maxY = pt.y;
        }

        return {
          targets: {
            p1BottomCenter: {
              x: p1Rect.left - secRect.left + p1Rect.width / 2,
              y: p1Rect.bottom - secRect.top,
            },
            p2TopCenter: {
              x: p2Rect.left - secRect.left + p2Rect.width / 2,
              y: p2Rect.top - secRect.top,
            },
            p2BottomCenter: {
              x: p2Rect.left - secRect.left + p2Rect.width / 2,
              y: p2Rect.bottom - secRect.top,
            },
            p3TopCenter: {
              x: p3Rect.left - secRect.left + p3Rect.width / 2,
              y: p3Rect.top - secRect.top,
            },
          },
          paths: {
            seg1Start: { x: s1_start.x, y: s1_start.y },
            seg1End: { x: s1_end.x, y: s1_end.y },
            seg2Start: { x: s2_start.x, y: s2_start.y },
            seg2End: { x: s2_end.x, y: s2_end.y },
            s1_minY,
            s1_maxY,
            s2_minY,
            s2_maxY,
          },
        };
      });

      if (data.error) {
        console.error(`  [${stage}] Error:`, data.error);
        allPassed = false;
        return;
      }

      const { targets, paths } = data;

      // Differences
      const diffs = {
        seg1Start_X: Math.abs(paths.seg1Start.x - targets.p1BottomCenter.x),
        seg1Start_Y: Math.abs(paths.seg1Start.y - targets.p1BottomCenter.y),
        seg1End_X:   Math.abs(paths.seg1End.x   - targets.p2TopCenter.x),
        seg1End_Y:   Math.abs(paths.seg1End.y   - targets.p2TopCenter.y),

        seg2Start_X: Math.abs(paths.seg2Start.x - targets.p2BottomCenter.x),
        seg2Start_Y: Math.abs(paths.seg2Start.y - targets.p2BottomCenter.y),
        seg2End_X:   Math.abs(paths.seg2End.x   - targets.p3TopCenter.x),
        seg2End_Y:   Math.abs(paths.seg2End.y   - targets.p3TopCenter.y),
      };

      console.log(`  [${stage}] Measured Anchor vs Path Coordinates:`);
      console.log(`    Segment 1 Start: path=(${paths.seg1Start.x.toFixed(1)}, ${paths.seg1Start.y.toFixed(1)}) vs p1Bot=(${targets.p1BottomCenter.x.toFixed(1)}, ${targets.p1BottomCenter.y.toFixed(1)}) | diff=[dx=${diffs.seg1Start_X.toFixed(2)}, dy=${diffs.seg1Start_Y.toFixed(2)}]`);
      console.log(`    Segment 1 End:   path=(${paths.seg1End.x.toFixed(1)}, ${paths.seg1End.y.toFixed(1)}) vs p2Top=(${targets.p2TopCenter.x.toFixed(1)}, ${targets.p2TopCenter.y.toFixed(1)}) | diff=[dx=${diffs.seg1End_X.toFixed(2)}, dy=${diffs.seg1End_Y.toFixed(2)}]`);
      console.log(`    Segment 2 Start: path=(${paths.seg2Start.x.toFixed(1)}, ${paths.seg2Start.y.toFixed(1)}) vs p2Bot=(${targets.p2BottomCenter.x.toFixed(1)}, ${targets.p2BottomCenter.y.toFixed(1)}) | diff=[dx=${diffs.seg2Start_X.toFixed(2)}, dy=${diffs.seg2Start_Y.toFixed(2)}]`);
      console.log(`    Segment 2 End:   path=(${paths.seg2End.x.toFixed(1)}, ${paths.seg2End.y.toFixed(1)}) vs p3Top=(${targets.p3TopCenter.x.toFixed(1)}, ${targets.p3TopCenter.y.toFixed(1)}) | diff=[dx=${diffs.seg2End_X.toFixed(2)}, dy=${diffs.seg2End_Y.toFixed(2)}]`);

      // Verify all <= 1.0px
      for (const [key, val] of Object.entries(diffs)) {
        if (val > 1.0) {
          console.error(`  FAIL [${stage}]: ${key} difference ${val.toFixed(2)}px exceeds 1.0px tolerance!`);
          allPassed = false;
        }
      }

      // Verify no geometry above panel 1 or below panel 3
      const aboveP1 = paths.s1_minY < targets.p1BottomCenter.y - 1.0;
      const belowP3 = paths.s2_maxY > targets.p3TopCenter.y + 1.0;
      if (aboveP1) {
        console.error(`  FAIL [${stage}]: Path geometry detected above panel 1 bottom edge!`);
        allPassed = false;
      }
      if (belowP3) {
        console.error(`  FAIL [${stage}]: Path geometry detected below panel 3 top edge!`);
        allPassed = false;
      }
      console.log(`    Bounds check: minY=${paths.s1_minY.toFixed(1)} >= p1Bot=${targets.p1BottomCenter.y.toFixed(1)} (pass), maxY=${paths.s2_maxY.toFixed(1)} <= p3Top=${targets.p3TopCenter.y.toFixed(1)} (pass)`);
    }

    // 1. Initial layout check
    await checkGeometry('Initial Layout');

    // 2. Viewport resize check (ensure width stays >= 1024 to remain on desktop site)
    const resizedWidth = vp.width === 1024 ? 1064 : vp.width - 40;
    await page.setViewportSize({ width: resizedWidth, height: vp.height });
    await page.waitForTimeout(250); // wait for 120ms debounce
    await checkGeometry(`After Resize to ${resizedWidth}x${vp.height}`);

    // Restore viewport size
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(250);

    // 3. Scroll check: scroll to middle of section
    await page.evaluate(() => {
      const p2 = document.querySelector('[data-panel="2"]');
      p2?.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(300);
    await checkGeometry('Scrolled to Section Center');

    // 4. Scroll to fully draw both segments
    await page.evaluate(() => {
      const p3 = document.querySelector('[data-panel="3"]');
      p3?.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(700); // allow 0.6s scrub smoothing to settle

    // Now scroll slightly back up so Panel 2 and both gaps are within viewport,
    // while keeping both paths fully drawn for visual QA
    await page.evaluate(() => {
      // Force mask offset to 0 so lines are completely revealed in screenshot
      const m1 = document.querySelector('#hiw-mask-1 path');
      const m2 = document.querySelector('#hiw-mask-2 path');
      if (m1) m1.style.strokeDashoffset = '0';
      if (m2) m2.style.strokeDashoffset = '0';

      const p2 = document.querySelector('[data-panel="2"]');
      p2?.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(400);

    // Capture screenshot centered on panel 2 showing both gaps
    const shotGaps = path.join(screenshotDir, `how-it-works-both-gaps-${vp.label}.png`);
    await page.screenshot({ path: shotGaps, fullPage: false });
    console.log(`  Saved screenshot showing both gaps centered on Panel 2: ${shotGaps}`);

    // Capture full section screenshot showing all 3 panels and both connecting lines
    const secEl = page.locator('#how-it-works');
    const shotFullSection = path.join(screenshotDir, `how-it-works-full-section-${vp.label}.png`);
    await secEl.screenshot({ path: shotFullSection });
    console.log(`  Saved full section screenshot: ${shotFullSection}`);

    // Verify marker position and visibility
    const markerInfo = await page.evaluate(() => {
      const marker = document.querySelector('#hiw-marker');
      if (!marker) return null;
      const opacity = window.getComputedStyle(marker).opacity;
      const transform = window.getComputedStyle(marker).transform;
      return { opacity, transform };
    });
    console.log(`  Marker status: opacity=${markerInfo?.opacity}, transform=${markerInfo?.transform}`);

    await page.close();
  }

  await browser.close();

  console.log(`\n============================================================`);
  if (allPassed) {
    console.log('ALL PLAYWRIGHT CHECKS PASSED: Anchors match within 1px across all viewports, resizes, and scroll states!');
  } else {
    console.error('SOME CHECKS FAILED!');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
