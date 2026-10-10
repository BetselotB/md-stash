import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('scripts/out');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function runCheck() {
  console.log('--- Testing Nav Synchronized Color Transition ---');
  let hasFailure = false;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // 2x screenshot crops
  });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="landing-nav"]');
  await page.waitForTimeout(500);

  const navLocator = page.locator('[data-testid="landing-nav"]');

  // Helper to sample transition
  const runTransition = async (targetTheme, expectedColor, cropFileName) => {
    return await page.evaluate(async ({ targetTheme, expectedColor }) => {
      const nav = document.querySelector('[data-testid="landing-nav"]');
      const home = document.querySelector('.nav-left > a');
      const pill = document.querySelector('.nav-right button.bg-orange');
      const menu = document.querySelector('.nav-menu-btn');
      const badgeRect = document.querySelector('.nav-badge svg rect');
      const badgeMd = document.querySelector('.nav-badge svg text');

      const completionTimes = {
        home: null,
        pillText: null,
        menuText: null,
        badgeFrame: null,
        badgeText: null,
      };

      nav.setAttribute('data-theme', targetTheme);
      const t0 = performance.now();

      while (performance.now() - t0 < 320) {
        const now = Math.round(performance.now() - t0);

        if (completionTimes.home === null && getComputedStyle(home).color === expectedColor) {
          completionTimes.home = now;
        }
        if (completionTimes.pillText === null && getComputedStyle(pill).color === expectedColor) {
          completionTimes.pillText = now;
        }
        if (completionTimes.menuText === null && getComputedStyle(menu).color === expectedColor) {
          completionTimes.menuText = now;
        }
        if (completionTimes.badgeFrame === null && getComputedStyle(badgeRect).stroke === expectedColor) {
          completionTimes.badgeFrame = now;
        }
        if (completionTimes.badgeText === null && getComputedStyle(badgeMd).fill === expectedColor) {
          completionTimes.badgeText = now;
        }

        if (
          completionTimes.home !== null &&
          completionTimes.pillText !== null &&
          completionTimes.menuText !== null &&
          completionTimes.badgeFrame !== null &&
          completionTimes.badgeText !== null
        ) {
          break;
        }

        await new Promise((r) => setTimeout(r, 16));
      }

      return completionTimes;
    }, { targetTheme, expectedColor });
  };

  // 1. SAGE -> CREAM
  console.log('1. Testing Sage -> Cream transition...');
  // Capture mid-transition crop at ~75ms
  const sageToCreamPromise = runTransition('cream', 'rgb(38, 51, 42)');
  await page.waitForTimeout(75);
  const crop1Path = path.join(OUT_DIR, 'nav-mid-transition-sage-to-cream-2x.png');
  await navLocator.screenshot({ path: crop1Path });
  console.log(`Saved mid-transition crop: ${crop1Path}`);

  const sageToCreamTimes = await sageToCreamPromise;
  console.log('Sage -> Cream completion times (ms):', sageToCreamTimes);

  const times1 = Object.values(sageToCreamTimes);
  const minTime1 = Math.min(...times1);
  const maxTime1 = Math.max(...times1);
  const diff1 = maxTime1 - minTime1;
  console.log(`Max difference: ${diff1}ms (min: ${minTime1}ms, max: ${maxTime1}ms)`);

  if (diff1 <= 30) {
    console.log(`✓ PASS: All nav elements reached final cream color within ${diff1}ms of each other (<= 30ms limit)`);
  } else {
    console.error(`FAIL: Color sync difference ${diff1}ms exceeds 30ms limit`);
    hasFailure = true;
  }

  await page.waitForTimeout(200);

  // 2. CREAM -> SAGE
  console.log('2. Testing Cream -> Sage transition...');
  const creamToSagePromise = runTransition('sage', 'rgb(248, 247, 230)');
  await page.waitForTimeout(75);
  const crop2Path = path.join(OUT_DIR, 'nav-mid-transition-cream-to-sage-2x.png');
  await navLocator.screenshot({ path: crop2Path });
  console.log(`Saved mid-transition crop: ${crop2Path}`);

  const creamToSageTimes = await creamToSagePromise;
  console.log('Cream -> Sage completion times (ms):', creamToSageTimes);

  const times2 = Object.values(creamToSageTimes);
  const minTime2 = Math.min(...times2);
  const maxTime2 = Math.max(...times2);
  const diff2 = maxTime2 - minTime2;
  console.log(`Max difference: ${diff2}ms (min: ${minTime2}ms, max: ${maxTime2}ms)`);

  if (diff2 <= 30) {
    console.log(`✓ PASS: All nav elements reached final sage color within ${diff2}ms of each other (<= 30ms limit)`);
  } else {
    console.error(`FAIL: Color sync difference ${diff2}ms exceeds 30ms limit`);
    hasFailure = true;
  }

  // 3. Real scroll test: scroll down to cream curtain and back up
  console.log('3. Testing real scroll trigger transition...');
  await page.evaluate(() => {
    const el = document.querySelector('#cream-curtain');
    el?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);

  const scrolledTheme = await page.evaluate(() => {
    return document.querySelector('[data-testid="landing-nav"]').getAttribute('data-theme');
  });
  console.log(`Theme after scrolling into curtain: ${scrolledTheme}`);
  if (scrolledTheme === 'cream') {
    console.log('✓ PASS: ScrollTrigger flips theme to cream on scroll');
  } else {
    console.error(`FAIL: ScrollTrigger theme is ${scrolledTheme}, expected cream`);
    hasFailure = true;
  }

  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(400);

  const topTheme = await page.evaluate(() => {
    return document.querySelector('[data-testid="landing-nav"]').getAttribute('data-theme');
  });
  console.log(`Theme after scrolling back to top: ${topTheme}`);
  if (topTheme === 'sage') {
    console.log('✓ PASS: ScrollTrigger flips theme back to sage at top');
  } else {
    console.error(`FAIL: ScrollTrigger theme is ${topTheme}, expected sage`);
    hasFailure = true;
  }

  if (errors.length > 0) {
    console.error('FAIL: Console errors detected:', errors);
    hasFailure = true;
  } else {
    console.log('✓ PASS: Zero console errors');
  }

  await browser.close();

  if (hasFailure) {
    console.error('❌ SOME CHECKS FAILED');
    process.exit(1);
  } else {
    console.log('🎉 ALL NAV COLOR SYNCHRONIZATION CHECKS PASSED!');
  }
}

runCheck().catch((err) => {
  console.error('Fatal error in check-nav-colors:', err);
  process.exit(1);
});
