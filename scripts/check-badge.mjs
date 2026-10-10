import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('scripts/out');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function runBadgeCheck() {
  console.log('=== VERIFYING NAV BADGE SIZE & POSITION CONSISTENCY (HEADLESS PLAYWRIGHT) ===\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // 2x device scale for high-res crops
  });

  await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  // Helper to measure .nav-badge getBoundingClientRect
  async function measureBadge() {
    return await page.evaluate(() => {
      const badge = document.querySelector('.nav-badge');
      if (!badge) return null;
      const rect = badge.getBoundingClientRect();
      const style = window.getComputedStyle(badge);
      const nav = document.querySelector('nav');
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        transform: style.transform,
        dataScrolled: nav ? nav.getAttribute('data-scrolled') : null,
        dataTheme: nav ? nav.getAttribute('data-theme') : null,
      };
    });
  }

  // 1. Measure at scrollY 0 (Hero / Sage)
  const topMetrics = await measureBadge();
  console.log('1. Top of page (scrollY: 0, sage):');
  console.log(`   Dimensions: ${topMetrics.width.toFixed(2)}px x ${topMetrics.height.toFixed(2)}px`);
  console.log(`   Top offset: ${topMetrics.top.toFixed(2)}px, Left: ${topMetrics.left.toFixed(2)}px`);
  console.log(`   data-scrolled: ${topMetrics.dataScrolled}, data-theme: ${topMetrics.dataTheme}\n`);

  // Crop top badge at 2x
  const badgeEl = page.locator('.nav-badge');
  const shotTopPath = path.join(OUT_DIR, 'badge-top-2x.png');
  await badgeEl.screenshot({ path: shotTopPath });
  console.log(`✓ Saved 2x crop of top badge: ${shotTopPath}`);

  // 2. Scroll to 600px (Scrolled state over sage section)
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);

  const scrolled600Metrics = await measureBadge();
  console.log('\n2. Scrolled state (scrollY: 600, sage):');
  console.log(`   Dimensions: ${scrolled600Metrics.width.toFixed(2)}px x ${scrolled600Metrics.height.toFixed(2)}px`);
  console.log(`   Top offset: ${scrolled600Metrics.top.toFixed(2)}px, Left: ${scrolled600Metrics.left.toFixed(2)}px`);
  console.log(`   data-scrolled: ${scrolled600Metrics.dataScrolled}, data-theme: ${scrolled600Metrics.dataTheme}\n`);

  // Crop scrolled badge at 2x
  const shotScrolledPath = path.join(OUT_DIR, 'badge-scrolled-2x.png');
  await badgeEl.screenshot({ path: shotScrolledPath });
  console.log(`✓ Saved 2x crop of scrolled badge: ${shotScrolledPath}`);

  // 3. Scroll to cream section (How it works / scrollY ~1600px)
  await page.evaluate(() => {
    const hiw = document.querySelector('#how-it-works');
    if (hiw) hiw.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(400);

  const creamMetrics = await measureBadge();
  console.log('\n3. Scrolled state over Cream section (#how-it-works):');
  console.log(`   Dimensions: ${creamMetrics.width.toFixed(2)}px x ${creamMetrics.height.toFixed(2)}px`);
  console.log(`   Top offset: ${creamMetrics.top.toFixed(2)}px, Left: ${creamMetrics.left.toFixed(2)}px`);
  console.log(`   data-scrolled: ${creamMetrics.dataScrolled}, data-theme: ${creamMetrics.dataTheme}\n`);

  const shotCreamPath = path.join(OUT_DIR, 'badge-cream-2x.png');
  await badgeEl.screenshot({ path: shotCreamPath });
  console.log(`✓ Saved 2x crop of badge over cream: ${shotCreamPath}`);

  // Assertions:
  let hasFailure = false;

  // Compare top vs scrollY 600
  const dW_600 = Math.abs(topMetrics.width - scrolled600Metrics.width);
  const dH_600 = Math.abs(topMetrics.height - scrolled600Metrics.height);
  const dTop_600 = Math.abs(topMetrics.top - scrolled600Metrics.top);

  if (dW_600 > 1.0 || dH_600 > 1.0) {
    console.error(`FAIL: Badge size changed at scrollY 600! Width diff: ${dW_600.toFixed(2)}px, Height diff: ${dH_600.toFixed(2)}px`);
    hasFailure = true;
  } else {
    console.log(`✓ PASS: Badge width and height match within 1px between top and scrollY 600 (dW: ${dW_600.toFixed(2)}px, dH: ${dH_600.toFixed(2)}px)`);
  }

  if (dTop_600 > 1.0) {
    console.error(`FAIL: Badge top offset shifted! Diff: ${dTop_600.toFixed(2)}px`);
    hasFailure = true;
  } else {
    console.log(`✓ PASS: Badge top offset matches within 1px (dTop: ${dTop_600.toFixed(2)}px)`);
  }

  // Compare top vs cream section
  const dW_cream = Math.abs(topMetrics.width - creamMetrics.width);
  const dH_cream = Math.abs(topMetrics.height - creamMetrics.height);
  const dTop_cream = Math.abs(topMetrics.top - creamMetrics.top);

  if (dW_cream > 1.0 || dH_cream > 1.0) {
    console.error(`FAIL: Badge size changed over cream section! Width diff: ${dW_cream.toFixed(2)}px, Height diff: ${dH_cream.toFixed(2)}px`);
    hasFailure = true;
  } else {
    console.log(`✓ PASS: Badge width and height match within 1px between top and cream section (dW: ${dW_cream.toFixed(2)}px, dH: ${dH_cream.toFixed(2)}px)`);
  }

  if (dTop_cream > 1.0) {
    console.error(`FAIL: Badge top offset shifted over cream section! Diff: ${dTop_cream.toFixed(2)}px`);
    hasFailure = true;
  } else {
    console.log(`✓ PASS: Badge top offset matches within 1px over cream section (dTop: ${dTop_cream.toFixed(2)}px)`);
  }

  // Check overhanging: badge bottom should exceed glass bar bottom
  const glassBar = await page.evaluate(() => {
    const gb = document.querySelector('[data-testid="nav-glass-bar"]');
    return gb ? gb.getBoundingClientRect().bottom : null;
  });

  if (glassBar && scrolled600Metrics.bottom > glassBar) {
    console.log(`✓ PASS: Badge overhangs glass bar as intended (Badge bottom: ${scrolled600Metrics.bottom.toFixed(1)}px > Glass bar bottom: ${glassBar.toFixed(1)}px)`);
  } else {
    console.warn(`NOTE: Glass bar bottom: ${glassBar}, badge bottom: ${scrolled600Metrics.bottom}`);
  }

  await browser.close();

  if (hasFailure) {
    console.error('\n❌ BADGE CHECKS FAILED');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL BADGE CHECKS PASSED SUCCESSFULLY!');
  }
}

runBadgeCheck().catch((err) => {
  console.error(err);
  process.exit(1);
});
