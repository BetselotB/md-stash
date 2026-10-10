import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('scripts/out');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function parseRgb(colorStr) {
  // Matches rgb(r, g, b) or rgba(r, g, b, a) or color(srgb r g b)
  const matchRgba = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (matchRgba) {
    return {
      r: parseInt(matchRgba[1], 10),
      g: parseInt(matchRgba[2], 10),
      b: parseInt(matchRgba[3], 10),
    };
  }
  const matchColor = colorStr.match(/color\([^ ]+\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)/i);
  if (matchColor) {
    return {
      r: Math.round(parseFloat(matchColor[1]) * 255),
      g: Math.round(parseFloat(matchColor[2]) * 255),
      b: Math.round(parseFloat(matchColor[3]) * 255),
    };
  }
  return { r: 0, g: 0, b: 0 };
}

function getLuminance({ r, g, b }) {
  const rs = r / 255;
  const gs = g / 255;
  const bs = b / 255;
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

async function runCheck() {
  console.log('--- Testing /privacy Nav Theme & Glass Background ---');
  let hasFailure = false;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:5173/privacy', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="landing-nav"]');
  await page.waitForTimeout(300);

  const navLocator = page.locator('[data-testid="landing-nav"]');

  // 1. SCROLL TO SAGE SECTION (Hero area, scrolled state)
  console.log('1. Scrolling to sage hero section (y=180px)...');
  await page.evaluate(() => window.scrollTo(0, 180));
  await page.waitForTimeout(350);

  const sageState = await page.evaluate(() => {
    const nav = document.querySelector('[data-testid="landing-nav"]');
    const glass = nav.querySelector('.nav-glass');
    const link = nav.querySelector('.nav-left > a');
    const badgeSvg = nav.querySelector('.nav-badge svg');

    const glassStyle = window.getComputedStyle(glass);
    const linkStyle = window.getComputedStyle(link);
    const badgeStyle = window.getComputedStyle(badgeSvg);

    return {
      theme: nav.getAttribute('data-theme'),
      scrolled: nav.getAttribute('data-scrolled'),
      glassBg: glassStyle.backgroundColor,
      linkColor: linkStyle.color,
      badgeColor: badgeStyle.color,
    };
  });

  const sageBgRgb = parseRgb(sageState.theme === 'sage' ? sageState.glassBg : '');
  const sageLuminance = getLuminance(sageBgRgb);
  console.log(`Sage state: theme="${sageState.theme}", scrolled="${sageState.scrolled}"`);
  console.log(`Sage glass bg: ${sageState.glassBg} -> RGB(${sageBgRgb.r}, ${sageBgRgb.g}, ${sageBgRgb.b}), Luminance: ${sageLuminance.toFixed(3)}`);
  console.log(`Sage link color: ${sageState.linkColor}, badge color: ${sageState.badgeColor}`);

  if (sageState.theme === 'sage' && sageState.scrolled === 'true') {
    console.log('✓ PASS: Nav theme is "sage" and scrolled is "true" over sage hero');
  } else {
    console.error(`FAIL: Expected sage theme and scrolled true, got theme=${sageState.theme}, scrolled=${sageState.scrolled}`);
    hasFailure = true;
  }

  // Capture 2x crop of nav over sage (including full badge overhang)
  const sageCropPath = path.join(OUT_DIR, 'nav-sage-2x.png');
  await page.screenshot({ path: sageCropPath, clip: { x: 0, y: 0, width: 1440, height: 130 } });
  console.log(`Saved 2x crop over sage: ${sageCropPath}`);

  // 2. SCROLL TO CREAM SECTION (Curtain area)
  console.log('2. Scrolling to cream curtain section (y=950px)...');
  await page.evaluate(() => window.scrollTo(0, 950));
  await page.waitForTimeout(350);

  const creamState = await page.evaluate(() => {
    const nav = document.querySelector('[data-testid="landing-nav"]');
    const glass = nav.querySelector('.nav-glass');
    const link = nav.querySelector('.nav-left > a');
    const badgeSvg = nav.querySelector('.nav-badge svg');

    const glassStyle = window.getComputedStyle(glass);
    const linkStyle = window.getComputedStyle(link);
    const badgeStyle = window.getComputedStyle(badgeSvg);

    return {
      theme: nav.getAttribute('data-theme'),
      scrolled: nav.getAttribute('data-scrolled'),
      glassBg: glassStyle.backgroundColor,
      linkColor: linkStyle.color,
      badgeColor: badgeStyle.color,
    };
  });

  const creamBgRgb = parseRgb(creamState.theme === 'cream' ? creamState.glassBg : '');
  const creamLuminance = getLuminance(creamBgRgb);
  console.log(`Cream state: theme="${creamState.theme}", scrolled="${creamState.scrolled}"`);
  console.log(`Cream glass bg: ${creamState.glassBg} -> RGB(${creamBgRgb.r}, ${creamBgRgb.g}, ${creamBgRgb.b}), Luminance: ${creamLuminance.toFixed(3)}`);
  console.log(`Cream link color: ${creamState.linkColor}, badge color: ${creamState.badgeColor}`);

  if (creamState.theme === 'cream' && creamState.scrolled === 'true') {
    console.log('✓ PASS: Nav theme is "cream" and scrolled is "true" over cream curtain');
  } else {
    console.error(`FAIL: Expected cream theme and scrolled true, got theme=${creamState.theme}, scrolled=${creamState.scrolled}`);
    hasFailure = true;
  }

  // Assert Luminance comparison (sage is dark-ish, cream is light)
  if (sageLuminance < creamLuminance) {
    console.log(`✓ PASS: Sage glass background luminance (${sageLuminance.toFixed(3)}) is darker than cream glass background luminance (${creamLuminance.toFixed(3)})`);
  } else {
    console.error(`FAIL: Sage luminance (${sageLuminance.toFixed(3)}) is not darker than cream luminance (${creamLuminance.toFixed(3)})`);
    hasFailure = true;
  }

  // Assert link and badge colors flipped
  const sageLinkRgb = parseRgb(sageState.linkColor);
  const creamLinkRgb = parseRgb(creamState.linkColor);
  if (sageLinkRgb.r > 200 && creamLinkRgb.r < 100) {
    console.log('✓ PASS: Link text color flipped from cream over sage to ink over cream');
  } else {
    console.error(`FAIL: Link text color did not flip properly: sage=${sageState.linkColor}, cream=${creamState.linkColor}`);
    hasFailure = true;
  }

  const sageBadgeRgb = parseRgb(sageState.badgeColor);
  const creamBadgeRgb = parseRgb(creamState.badgeColor);
  if (sageBadgeRgb.r > 200 && creamBadgeRgb.r < 100) {
    console.log('✓ PASS: Badge color flipped with nav text from cream over sage to ink over cream');
  } else {
    console.error(`FAIL: Badge color did not flip properly: sage=${sageState.badgeColor}, cream=${creamState.badgeColor}`);
    hasFailure = true;
  }

  // Capture 2x crop of nav over cream (including full badge overhang)
  const creamCropPath = path.join(OUT_DIR, 'nav-cream-2x.png');
  await page.screenshot({ path: creamCropPath, clip: { x: 0, y: 0, width: 1440, height: 130 } });
  console.log(`Saved 2x crop over cream: ${creamCropPath}`);

  // 3. SCROLL TO FINAL SAGE SECTION (Footer / CTA)
  console.log('3. Scrolling to final sage section...');
  const scrollInfo = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('[data-nav-theme]')).map(s => {
      const r = s.getBoundingClientRect();
      return { tag: s.tagName, theme: s.getAttribute('data-nav-theme'), top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, height: s.offsetHeight };
    });
    return { scrollHeight: document.documentElement.scrollHeight, sections };
  });
  console.log('Sections on page:', scrollInfo);

  // Scroll to the top of the final section + 100px so nav is inside it
  const finalSec = scrollInfo.sections[scrollInfo.sections.length - 2]; // section before footer or footer
  const targetY = finalSec ? finalSec.top + 100 : scrollInfo.scrollHeight;
  console.log(`Scrolling to targetY=${targetY}px...`);
  await page.evaluate((y) => window.scrollTo(0, y), targetY);
  await page.waitForTimeout(400);

  const finalSageTheme = await page.evaluate(() => {
    return document.querySelector('[data-testid="landing-nav"]').getAttribute('data-theme');
  });
  console.log(`Final section theme: "${finalSageTheme}"`);
  if (finalSageTheme === 'sage') {
    console.log('✓ PASS: Nav theme flipped back to "sage" over final sage section / footer');
  } else {
    console.error(`FAIL: Expected nav theme to flip back to sage, got ${finalSageTheme}`);
    hasFailure = true;
  }

  // Check console errors
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
    console.log('🎉 ALL NAV THEME CHECKS PASSED SUCCESSFULLY!');
  }
}

runCheck().catch((err) => {
  console.error('Fatal error in check-privacy-nav:', err);
  process.exit(1);
});
