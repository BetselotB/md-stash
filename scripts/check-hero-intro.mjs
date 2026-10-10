import { chromium } from 'playwright';

async function runCheck() {
  console.log('--- Testing Hero Intro Fixes ---');
  let hasFailure = false;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Console error tracking
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // TEST 1: Load "/" and measure time from headline landing to both highlights done
  console.log('1. Loading "/" and measuring highlight sequence timing...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  // Wait for the intro timeline to complete both highlights
  await page.waitForFunction(() => {
    return typeof window !== 'undefined' &&
      typeof window.__headlineLandedAt === 'number' &&
      typeof window.__highlightsDoneAt === 'number';
  }, { timeout: 8000 });

  const { headlineLandedAt, highlightsDoneAt } = await page.evaluate(() => {
    return {
      headlineLandedAt: window.__headlineLandedAt,
      highlightsDoneAt: window.__highlightsDoneAt,
    };
  });

  const durationSec = (highlightsDoneAt - headlineLandedAt) / 1000;
  console.log(`Headline landed at ~${Math.round(headlineLandedAt)}ms, highlights completed at ~${Math.round(highlightsDoneAt)}ms.`);
  console.log(`Time from headline landing to highlights done: ${durationSec.toFixed(2)}s`);

  if (durationSec >= 2.7 && durationSec <= 3.3) {
    console.log(`✓ PASS: Highlights finished within ~3.0s (±0.3s) after headline landing (${durationSec.toFixed(2)}s)`);
  } else {
    console.error(`FAIL: Highlights duration from headline landing took ${durationSec.toFixed(2)}s (expected ~3.0s ± 0.3s)`);
    hasFailure = true;
  }

  // TEST 2: Reload and assert intro plays again
  console.log('2. Reloading page and asserting intro replays...');
  await page.reload({ waitUntil: 'domcontentloaded' });

  // On reload, assert that before intro finishes, initial state is animating, and then finishes
  await page.waitForFunction(() => {
    return typeof window !== 'undefined' &&
      typeof window.__highlightsDoneAt === 'number';
  }, { timeout: 8000 });

  const reloadHighlightsDone = await page.evaluate(() => {
    const hlBg = document.querySelector('.hl-ready .hl-bg');
    return hlBg ? hlBg.style.width : '';
  });

  if (reloadHighlightsDone === '100%') {
    console.log(`✓ PASS: Intro replayed successfully on reload (highlights expanded to 100%)`);
  } else {
    console.error(`FAIL: Intro did not complete on reload: settledWidth = ${reloadHighlightsDone}`);
    hasFailure = true;
  }

  // TEST 3: Scroll down 1200px and reload, assert scroll is at top and intro plays
  console.log('3. Scrolling down 1200px and reloading...');
  await page.evaluate(() => {
    window.scrollTo(0, 1200);
  });
  await page.waitForTimeout(200);
  const scrollBeforeReload = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop);
  console.log(`Scroll position before reload: ${scrollBeforeReload}px`);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(100);

  const scrollAfterReload = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop);
  console.log(`Scroll position right after reload: ${scrollAfterReload}px`);

  if (scrollAfterReload <= 10) {
    console.log(`✓ PASS: Page scroll restored to top (0px) on reload while scrolled`);
  } else {
    console.error(`FAIL: Page scroll was not reset to top on reload: ${scrollAfterReload}px`);
    hasFailure = true;
  }

  // Wait for intro to finish from reload
  await page.waitForFunction(() => {
    return typeof window !== 'undefined' &&
      typeof window.__highlightsDoneAt === 'number';
  }, { timeout: 8000 });

  // TEST 4: Navigate to /app and back through React Router, assert intro does NOT replay
  console.log('4. Navigating to /app and back via router...');
  const openAppBtn = page.locator('[data-testid="landing-nav"]').getByRole('link', { name: 'Open MDstash' });
  await openAppBtn.click();
  await page.waitForURL('**/app');
  await page.waitForTimeout(400);

  // Navigate back to "/" via browser back (in-memory router history)
  console.log('Navigating back to "/" in same session...');
  await page.evaluate(() => window.history.back());
  await page.waitForURL('http://localhost:5173/');

  // Check immediately (50ms) if highlights are already settled and is-loading is not present
  const clientNavState = await page.evaluate(() => {
    const hlBg1 = document.querySelector('.hl-markdown .hl-bg');
    const hlBg2 = document.querySelector('.hl-ready .hl-bg');
    const isLoading = document.documentElement.classList.contains('is-loading');
    return {
      w1: hlBg1 ? hlBg1.style.width : '',
      w2: hlBg2 ? hlBg2.style.width : '',
      isLoading,
    };
  });

  if (clientNavState.w1 === '100%' && clientNavState.w2 === '100%' && !clientNavState.isLoading) {
    console.log(`✓ PASS: In-app router navigation back to "/" skips the intro immediately (settled width 100%, is-loading: false)`);
  } else {
    console.error(`FAIL: In-app navigation back to "/" did not skip intro as expected:`, clientNavState);
    hasFailure = true;
  }

  // TEST 5: ?nointro skips intro
  console.log('5. Navigating to "/?nointro" and asserting intro is skipped...');
  await page.goto('http://localhost:5173/?nointro', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.hl-ready .hl-bg');
  await page.waitForTimeout(50);

  const noIntroState = await page.evaluate(() => {
    const hlBg1 = document.querySelector('.hl-markdown .hl-bg');
    const hlBg2 = document.querySelector('.hl-ready .hl-bg');
    const isLoading = document.documentElement.classList.contains('is-loading');
    return {
      w1: hlBg1 ? hlBg1.style.width : '',
      w2: hlBg2 ? hlBg2.style.width : '',
      isLoading,
    };
  });

  if (noIntroState.w1 === '100%' && noIntroState.w2 === '100%' && !noIntroState.isLoading) {
    console.log(`✓ PASS: ?nointro immediately renders settled state without intro`);
  } else {
    console.error(`FAIL: ?nointro did not render settled state immediately:`, noIntroState);
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
    console.log('🎉 ALL HERO INTRO CHECKS PASSED SUCCESSFULLY!');
  }
}

runCheck().catch((err) => {
  console.error('Fatal error in check-hero-intro:', err);
  process.exit(1);
});
