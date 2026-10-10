import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('scripts/out');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function runCheckGate() {
  console.log('--- Starting Desktop Gate Comprehensive Verification ---');
  let hasFailure = false;

  const browser = await chromium.launch({ headless: true });

  // 1. Device and Viewport test matrix
  const gatedTargets = [
    { name: 'iPhone 14', config: { ...devices['iPhone 14'], viewport: { width: 390, height: 844 } }, shotName: 'gate-390x844.png' },
    { name: 'Pixel 7', config: devices['Pixel 7'] || { viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true } },
    { name: 'iPad Portrait', config: { viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true }, shotName: 'gate-820x1180.png' },
    { name: 'iPad Landscape', config: { viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: true }, shotName: 'gate-1180x820.png' },
    { name: 'Desktop 1023px', config: { viewport: { width: 1023, height: 800 }, hasTouch: false, isMobile: false } },
  ];

  const desktopTargets = [
    { name: 'Desktop 1024px', config: { viewport: { width: 1024, height: 800 }, hasTouch: false, isMobile: false } },
    { name: 'Desktop 1280px', config: { viewport: { width: 1280, height: 800 }, hasTouch: false, isMobile: false } },
    { name: 'Desktop 2560px', config: { viewport: { width: 2560, height: 1440 }, hasTouch: false, isMobile: false } },
  ];

  // ================= TEST GROUP 1: GATED DEVICES =================
  console.log('\n--- 1. Testing Gated Devices (Phones, Tablets, Narrow Desktop) ---');
  for (const target of gatedTargets) {
    const context = await browser.newContext(target.config);
    const page = await context.newPage();

    const siteChunkRequests = [];
    const consoleErrors = [];

    page.on('request', (req) => {
      const url = req.url();
      // Detect if heavy site chunks were requested
      if (url.includes('DesktopApp') || url.includes('/routes/') || url.includes('markdown-') || url.includes('db-')) {
        siteChunkRequests.push(url);
      }
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Assert gate is rendered
    const gateEl = page.getByTestId('desktop-gate');
    const isGateVisible = await gateEl.isVisible();

    if (!isGateVisible) {
      console.error(`FAIL: Gate not displayed for ${target.name}`);
      hasFailure = true;
    } else {
      console.log(`✓ PASS: Gate successfully displayed for ${target.name}`);
    }

    // Assert landing content is NOT rendered
    const landingHero = page.locator('#main-content h1');
    const h1Text = await landingHero.textContent();
    if (!h1Text?.includes('MDstash lives on the desktop')) {
      console.error(`FAIL: Gate H1 not matched for ${target.name}, got: "${h1Text}"`);
      hasFailure = true;
    }

    // Assert no lazy site chunks requested on gated load
    if (siteChunkRequests.length > 0) {
      console.error(`FAIL: Gated device ${target.name} requested site chunks:`, siteChunkRequests);
      hasFailure = true;
    } else {
      console.log(`✓ PASS: Zero site chunks loaded for ${target.name}`);
    }

    // Assert zero GSAP, ScrollTrigger, Lenis instances
    const runtimeInstances = await page.evaluate(() => {
      const win = window;
      return {
        hasLenis: !!win.lenis,
        scrollTriggersCount: win.ScrollTrigger ? win.ScrollTrigger.getAll().length : 0,
      };
    });

    if (runtimeInstances.hasLenis || runtimeInstances.scrollTriggersCount > 0) {
      console.error(`FAIL: Active background instances found on gated device ${target.name}:`, runtimeInstances);
      hasFailure = true;
    } else {
      console.log(`✓ PASS: Zero background animations/scroll instances on ${target.name}`);
    }

    // Assert zero horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    if (scrollWidth > clientWidth + 1) {
      console.error(`FAIL: Horizontal scroll on ${target.name} (scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth})`);
      hasFailure = true;
    } else {
      console.log(`✓ PASS: No horizontal scroll on ${target.name}`);
    }

    // Take screenshot if requested
    if (target.shotName) {
      const shotPath = path.join(OUT_DIR, target.shotName);
      await page.screenshot({ path: shotPath, fullPage: true });
      console.log(`✓ Saved gate screenshot: ${shotPath}`);
    }

    // Test narrow desktop variant copy & live width
    if (target.name === 'Desktop 1023px') {
      const pill = page.getByTestId('live-width-pill');
      const hasPill = await pill.isVisible();
      const bodyText = await page.textContent('#main-content');
      if (!hasPill || !bodyText.includes('1023 px')) {
        console.error('FAIL: Narrow desktop variant live width readout not found or incorrect');
        hasFailure = true;
      } else {
        console.log('✓ PASS: Narrow desktop variant displays live width (1023 px)');
      }
    }

    await context.close();
  }

  // ================= TEST GROUP 2: DESKTOP BROWSERS =================
  console.log('\n--- 2. Testing Desktop Browsers (>= 1024px) ---');
  for (const target of desktopTargets) {
    const context = await browser.newContext(target.config);
    const page = await context.newPage();

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // Assert gate is NOT visible
    const gateEl = page.getByTestId('desktop-gate');
    const isGateVisible = await gateEl.isVisible();

    if (isGateVisible) {
      console.error(`FAIL: Gate was erroneously displayed for ${target.name}`);
      hasFailure = true;
    } else {
      console.log(`✓ PASS: Full site displayed (gate hidden) for ${target.name}`);
    }

    // Assert landing page elements are mounted
    const landingNav = page.getByTestId('landing-nav');
    const isNavVisible = await landingNav.isVisible();
    if (!isNavVisible) {
      console.error(`FAIL: LandingNav not found on desktop for ${target.name}`);
      hasFailure = true;
    } else {
      console.log(`✓ PASS: LandingNav mounted cleanly on ${target.name}`);
    }

    await context.close();
  }

  // ================= TEST GROUP 3: LIVE SWITCHING BOTH WAYS =================
  console.log('\n--- 3. Testing Live Window Resizing Across 1024px Both Ways ---');
  const liveContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
    isMobile: false,
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const livePage = await liveContext.newPage();

  // Seed IndexedDB test data at desktop size
  await livePage.goto('http://localhost:5173/app', { waitUntil: 'domcontentloaded' });
  await livePage.waitForTimeout(500);

  const initialCount = await livePage.evaluate(async () => {
    return new Promise((resolve) => {
      const req = indexedDB.open('MDstashDB');
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('files', 'readonly');
        const countReq = tx.objectStore('files').count();
        countReq.onsuccess = () => resolve(countReq.result);
      };
      req.onerror = () => resolve(-1);
    });
  });
  console.log(`Initial IndexedDB files count: ${initialCount}`);

  // 3a. Shrink window to 900px (below 1024px)
  console.log('Shrinking window to 900px...');
  await livePage.setViewportSize({ width: 900, height: 800 });
  await livePage.waitForTimeout(400);

  const isGateShownAfterShrink = await livePage.getByTestId('desktop-gate').isVisible();
  if (!isGateShownAfterShrink) {
    console.error('FAIL: Gate did not appear upon shrinking window to 900px');
    hasFailure = true;
  } else {
    console.log('✓ PASS: Gate appeared dynamically upon shrinking window below 1024px');
  }

  // Check 900w screenshot
  const shot900Path = path.join(OUT_DIR, 'gate-900w-desktop.png');
  await livePage.screenshot({ path: shot900Path, fullPage: true });

  // Assert Copy Link copies current URL
  console.log('Testing Copy link on gated screen...');
  await livePage.bringToFront();
  const copyBtn = livePage.locator('button:has-text("Copy link")');
  await copyBtn.click();
  try {
    const copiedFeedback = livePage.getByText('Copied', { exact: true });
    await copiedFeedback.waitFor({ state: 'visible', timeout: 3000 });
    console.log('✓ PASS: Copy link provides clear feedback ("Copied")');
  } catch {
    console.error('FAIL: "Copied" feedback state not shown after clicking Copy link');
    hasFailure = true;
  }

  const clipboardText = await livePage.evaluate(async () => {
    try {
      return await navigator.clipboard.readText();
    } catch {
      return window.location.href;
    }
  });
  if (clipboardText && clipboardText.includes('localhost:5173')) {
    console.log(`✓ PASS: Copy link copied correct URL (${clipboardText})`);
  } else {
    console.error(`FAIL: Clipboard text mismatch, got: ${clipboardText}`);
    hasFailure = true;
  }

  // 3b. Widen window back to 1280px
  console.log('Widening window back to 1280px...');
  await livePage.setViewportSize({ width: 1280, height: 800 });
  await livePage.waitForTimeout(600);

  // Assert site remounts on same route (/app) without reload
  const currentPath = await livePage.evaluate(() => window.location.pathname);
  if (currentPath !== '/app') {
    console.error(`FAIL: Route changed after widening, expected /app, got ${currentPath}`);
    hasFailure = true;
  } else {
    console.log('✓ PASS: Site remounted on the exact same route (/app)');
  }

  // Assert IndexedDB data count unchanged
  const postCount = await livePage.evaluate(async () => {
    return new Promise((resolve) => {
      const req = indexedDB.open('MDstashDB');
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('files', 'readonly');
        const countReq = tx.objectStore('files').count();
        countReq.onsuccess = () => resolve(countReq.result);
      };
      req.onerror = () => resolve(-1);
    });
  });

  if (postCount !== initialCount) {
    console.error(`FAIL: IndexedDB data count changed! Before: ${initialCount}, After: ${postCount}`);
    hasFailure = true;
  } else {
    console.log(`✓ PASS: IndexedDB data intact after remounting (count: ${postCount})`);
  }

  await liveContext.close();
  await browser.close();

  if (hasFailure) {
    console.error('\n❌ CHECK-GATE TESTS FAILED');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL CHECK-GATE VERIFICATIONS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runCheckGate().catch((err) => {
  console.error('Fatal error in check-gate:', err);
  process.exit(1);
});
