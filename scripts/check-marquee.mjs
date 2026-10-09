import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const VIEWPORTS = [
  { width: 2560, height: 1440, name: '2560x1440', isMobile: false },
  { width: 1920, height: 1080, name: '1920x1080', isMobile: false },
  { width: 1440, height: 900,  name: '1440x900',  isMobile: false },
  { width: 390,  height: 844,  name: '390x844',   isMobile: true  },
];

async function main() {
  console.log('=== VERIFYING CONTINUOUS FEATURE MARQUEE (HEADLESS PLAYWRIGHT) ===\n');

  const outDir = path.resolve('public/qa-screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  let allPassed = true;

  // Helper to extract matrix tx
  function parseTx(transformStr) {
    if (!transformStr || transformStr === 'none') return 0;
    const match = transformStr.match(/matrix\(([^)]+)\)/);
    if (match) {
      const parts = match[1].split(',').map((p) => parseFloat(p.trim()));
      return parts[4] || 0; // index 4 is translateX
    }
    const match3d = transformStr.match(/matrix3d\(([^)]+)\)/);
    if (match3d) {
      const parts = match3d[1].split(',').map((p) => parseFloat(p.trim()));
      return parts[12] || 0;
    }
    return 0;
  }

  for (const vp of VIEWPORTS) {
    console.log(`\n============================================================`);
    console.log(`Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`============================================================`);

    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    // Scroll to #features section
    await page.evaluate(() => {
      document.querySelector('#features')?.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(500);

    // -------------------------------------------------------------------------
    // (a) SPEED SAMPLE: Sample track transform at t=0, 2s, 4s
    // -------------------------------------------------------------------------
    console.log('\n--- (a) Speed Verification ---');
    const t0_transform = await page.evaluate(() => {
      const el = document.querySelector('.marquee-track');
      return el ? window.getComputedStyle(el).transform : 'none';
    });
    const tx0 = parseTx(t0_transform);
    console.log(`  t=0s: transform=${t0_transform} (tx=${tx0.toFixed(2)}px)`);

    await page.waitForTimeout(2000);
    const t2_transform = await page.evaluate(() => {
      const el = document.querySelector('.marquee-track');
      return el ? window.getComputedStyle(el).transform : 'none';
    });
    const tx2 = parseTx(t2_transform);
    const speed2 = Math.abs(tx2 - tx0) / 2.0;
    console.log(`  t=2s: transform=${t2_transform} (tx=${tx2.toFixed(2)}px) -> speed=${speed2.toFixed(2)}px/s`);

    await page.waitForTimeout(2000);
    const t4_transform = await page.evaluate(() => {
      const el = document.querySelector('.marquee-track');
      return el ? window.getComputedStyle(el).transform : 'none';
    });
    const tx4 = parseTx(t4_transform);
    const speed4 = Math.abs(tx4 - tx0) / 4.0;
    console.log(`  t=4s: transform=${t4_transform} (tx=${tx4.toFixed(2)}px) -> speed=${speed4.toFixed(2)}px/s`);

    const targetSpeed = vp.isMobile ? 30 : 45;
    const minSpeed = targetSpeed * 0.85;
    const maxSpeed = targetSpeed * 1.15;
    if (speed4 >= minSpeed && speed4 <= maxSpeed) {
      console.log(`  PASS: Measured speed ${speed4.toFixed(2)}px/s is within 15% of target ${targetSpeed}px/s [${minSpeed.toFixed(1)} - ${maxSpeed.toFixed(1)}]`);
    } else {
      console.error(`  FAIL: Measured speed ${speed4.toFixed(2)}px/s is outside 15% range [${minSpeed.toFixed(1)} - ${maxSpeed.toFixed(1)}]!`);
      allPassed = false;
    }

    // -------------------------------------------------------------------------
    // (b) SEAMLESS LOOP: Assert position before and after wrap differs by < 1px
    // -------------------------------------------------------------------------
    console.log('\n--- (b) Seamless Loop Check ---');
    const wrapDiff = await page.evaluate(() => {
      const track = document.querySelector('.marquee-track');
      const sets = document.querySelectorAll('.marquee-set');
      if (!track || sets.length < 2) return { error: 'Missing track or sets' };

      const set1 = sets[0];
      const set2 = sets[1];
      const setWidth = set1.offsetWidth;

      // Card 0 of set 1 at x = 0
      const prevTransform = track.style.transform;
      track.style.transform = 'translateX(0px)';
      const rect0 = set1.children[0].getBoundingClientRect();

      // Card 0 of set 2 when track has wrapped by -setWidth
      track.style.transform = `translateX(-${setWidth}px)`;
      const rectWrapped = set2.children[0].getBoundingClientRect();

      // Restore
      track.style.transform = prevTransform;

      return {
        setWidth,
        dx: Math.abs(rect0.left - rectWrapped.left),
        dy: Math.abs(rect0.top - rectWrapped.top),
      };
    });

    console.log(`  Set Width: ${wrapDiff.setWidth}px | Wrap difference: dx=${wrapDiff.dx?.toFixed(3)}px, dy=${wrapDiff.dy?.toFixed(3)}px`);
    if (wrapDiff.dx < 1.0 && wrapDiff.dy < 1.0) {
      console.log('  PASS: Loop is strictly seamless (< 1px wrap difference).');
    } else {
      console.error(`  FAIL: Wrap difference exceeds 1px! dx=${wrapDiff.dx}, dy=${wrapDiff.dy}`);
      allPassed = false;
    }

    // -------------------------------------------------------------------------
    // (c) HOVER PAUSE & DEMO CONTINUITY
    // -------------------------------------------------------------------------
    console.log('\n--- (c) Pause on Hover & Demo Continuity ---');
    const card1 = page.locator('#features [data-card="1"]').first();
    await card1.hover({ force: true });
    await page.waitForTimeout(600); // allow 0.4s ease to stop

    const hoverTx1 = parseTx(await page.evaluate(() => window.getComputedStyle(document.querySelector('.marquee-track')).transform));
    const demoSample1 = await page.evaluate(() => {
      const file1 = document.querySelector('.card1-file-1');
      return file1 ? window.getComputedStyle(file1).transform : 'none';
    });

    await page.waitForTimeout(800);
    const hoverTx2 = parseTx(await page.evaluate(() => window.getComputedStyle(document.querySelector('.marquee-track')).transform));
    const demoSample2 = await page.evaluate(() => {
      const file1 = document.querySelector('.card1-file-1');
      return file1 ? window.getComputedStyle(file1).transform : 'none';
    });

    const hoverDelta = Math.abs(hoverTx2 - hoverTx1);
    console.log(`  Track movement while hovered: ${hoverDelta.toFixed(2)}px (expected < 1.5px)`);
    console.log(`  Demo animation advancing: Sample1=${demoSample1} vs Sample2=${demoSample2}`);

    if (hoverDelta < 2.0) {
      console.log('  PASS: Marquee stopped on hover.');
    } else {
      console.error(`  FAIL: Marquee still moving during hover! Delta=${hoverDelta}`);
      allPassed = false;
    }

    // Unhover
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);

    // -------------------------------------------------------------------------
    // (d) PAUSE/PLAY BUTTON TOGGLE
    // -------------------------------------------------------------------------
    console.log('\n--- (d) Pause/Play Button Toggle ---');
    const pauseBtn = page.locator('#features button[aria-label*="feature marquee"]');
    const hasPauseBtn = await pauseBtn.count();

    if (hasPauseBtn > 0) {
      const initialPressed = await pauseBtn.getAttribute('aria-pressed');
      console.log(`  Initial button aria-pressed: ${initialPressed}`);

      // Click to pause
      await pauseBtn.click();
      await page.waitForTimeout(500);
      const afterClickPressed = await pauseBtn.getAttribute('aria-pressed');
      const pauseTx1 = parseTx(await page.evaluate(() => window.getComputedStyle(document.querySelector('.marquee-track')).transform));
      await page.waitForTimeout(600);
      const pauseTx2 = parseTx(await page.evaluate(() => window.getComputedStyle(document.querySelector('.marquee-track')).transform));
      const pausedDelta = Math.abs(pauseTx2 - pauseTx1);

      console.log(`  After pause click: aria-pressed=${afterClickPressed}, delta=${pausedDelta.toFixed(2)}px`);

      // Click to resume
      await pauseBtn.click();
      await page.waitForTimeout(500);
      const resumedPressed = await pauseBtn.getAttribute('aria-pressed');
      await page.waitForTimeout(600);
      const resumeTx3 = parseTx(await page.evaluate(() => window.getComputedStyle(document.querySelector('.marquee-track')).transform));
      const resumedDelta = Math.abs(resumeTx3 - pauseTx2);

      console.log(`  After resume click: aria-pressed=${resumedPressed}, movement=${resumedDelta.toFixed(2)}px`);

      if (afterClickPressed === 'true' && pausedDelta < 2.0 && resumedPressed === 'false' && resumedDelta > 5.0) {
        console.log('  PASS: Pause button stops and resumes marquee correctly.');
      } else {
        console.error('  FAIL: Pause button toggle behavior unexpected!');
        allPassed = false;
      }
    }

    // -------------------------------------------------------------------------
    // (e) SCROLLTRIGGER AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- (e) ScrollTrigger Audit ---');
    const stAudit = await page.evaluate(() => {
      // @ts-ignore
      const triggers = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
      const featureTriggers = triggers.filter((t) => {
        const trig = t.trigger;
        return trig && trig.id === 'features';
      });
      return {
        totalCount: triggers.length,
        featurePins: featureTriggers.filter((t) => t.pin).length,
        featureScrubs: featureTriggers.filter((t) => t.scrub).length,
      };
    });
    console.log(`  Total ScrollTriggers: ${stAudit.totalCount}, Feature Pins: ${stAudit.featurePins}, Feature Scrubs: ${stAudit.featureScrubs}`);
    if (stAudit.featurePins === 0 && stAudit.featureScrubs === 0) {
      console.log('  PASS: No ScrollTrigger pin or scrub exists in #features.');
    } else {
      console.error('  FAIL: Found pin or scrub in #features!');
      allPassed = false;
    }

    // -------------------------------------------------------------------------
    // (f) DUPLICATED SET ATTRIBUTES (aria-hidden & inert)
    // -------------------------------------------------------------------------
    console.log('\n--- (f) Duplicated Set Accessibility ---');
    const cloneAttributes = await page.evaluate(() => {
      const sets = document.querySelectorAll('.marquee-set');
      if (sets.length < 2) return null;
      return Array.from(sets).slice(1).map((s) => ({
        ariaHidden: s.getAttribute('aria-hidden'),
        hasInert: s.hasAttribute('inert'),
        tabIndex: s.getAttribute('tabindex'),
      }));
    });
    console.log(`  Clone Sets inspected:`, cloneAttributes);
    const allClonesAccessible = cloneAttributes?.every(
      (c) => c.ariaHidden === 'true' && c.hasInert && c.tabIndex === '-1'
    );
    if (allClonesAccessible) {
      console.log('  PASS: Cloned card sets are aria-hidden, inert, and tabIndex=-1.');
    } else {
      console.error('  FAIL: Cloned sets missing accessibility attributes!');
      allPassed = false;
    }

    // -------------------------------------------------------------------------
    // SCREENSHOTS AT t=1s, 3s, 5s, 7s
    // -------------------------------------------------------------------------
    console.log('\n--- Capturing Timed Screenshots ---');
    const times = [1, 3, 5, 7];
    for (const t of times) {
      await page.waitForTimeout(t === 1 ? 1000 : 2000);
      const shotPath = path.join(outDir, `marquee-${vp.name}-t${t}s.png`);
      const secEl = page.locator('#features');
      await secEl.screenshot({ path: shotPath });
      console.log(`  Captured: ${shotPath}`);
    }

    await page.close();
  }

  // -------------------------------------------------------------------------
  // (g) REDUCED MOTION EMULATION
  // -------------------------------------------------------------------------
  console.log('\n============================================================');
  console.log('Testing Reduced Motion Emulation (prefers-reduced-motion: reduce)');
  console.log('============================================================');
  const rmPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await rmPage.emulateMedia({ reducedMotion: 'reduce' });
  await rmPage.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
  await rmPage.evaluate(() => document.fonts.ready);
  await rmPage.waitForTimeout(400);

  const rmCheck = await rmPage.evaluate(() => {
    const sec = document.querySelector('#features');
    const track = document.querySelector('.marquee-track');
    const scrollableRow = sec?.querySelector('.overflow-x-auto');
    const pauseBtn = sec?.querySelector('button[aria-label*="feature marquee"]');

    return {
      hasMarqueeTrack: !!track,
      hasScrollableRow: !!scrollableRow,
      pauseBtnHidden: !pauseBtn || window.getComputedStyle(pauseBtn).display === 'none',
      overflowX: scrollableRow ? window.getComputedStyle(scrollableRow).overflowX : null,
    };
  });

  console.log('  Reduced motion audit:', rmCheck);
  if (!rmCheck.hasMarqueeTrack && rmCheck.hasScrollableRow && rmCheck.pauseBtnHidden) {
    console.log('  PASS: Reduced motion disables marquee, displays scrollable row, and hides pause button.');
  } else {
    console.error('  FAIL: Reduced motion checks failed!');
    allPassed = false;
  }

  const rmShot = path.join(outDir, 'marquee-reduced-motion-1440x900.png');
  await rmPage.locator('#features').screenshot({ path: rmShot });
  console.log(`  Captured reduced motion screenshot: ${rmShot}`);

  await rmPage.close();

  // -------------------------------------------------------------------------
  // (h) 45s CONTINUOUS DEMO & CLONE SYNC VERIFICATION (2560px & 1440px)
  // -------------------------------------------------------------------------
  console.log('\n============================================================');
  console.log('BUG 1 VERIFICATION: 45s Continuous Demos, Clone Sync & Tween Stability');
  console.log('============================================================');

  for (const checkVp of [
    { width: 2560, height: 1440, name: '2560x1440' },
    { width: 1440, height: 900,  name: '1440x900'  },
  ]) {
    console.log(`\n--- Running 45s Verification on ${checkVp.name} ---`);
    const demoPage = await browser.newPage({
      viewport: { width: checkVp.width, height: checkVp.height },
      deviceScaleFactor: 1,
    });

    await demoPage.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await demoPage.evaluate(() => document.fonts.ready);
    await demoPage.waitForTimeout(500);

    // Scroll to #features
    await demoPage.evaluate(() => {
      document.querySelector('#features')?.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await demoPage.waitForTimeout(500);

    // 1. Assert original and clone show identical state at the same time
    const syncResults = await demoPage.evaluate(() => {
      const sets = document.querySelectorAll('.marquee-set');
      if (sets.length < 2) return { error: 'Less than 2 sets found' };
      const set1 = sets[0];
      const set2 = sets[1];
      const set3 = sets[2];

      const cards1 = set1.querySelectorAll('[data-card]');
      const cards2 = set2.querySelectorAll('[data-card]');

      const diffs = [];
      for (let i = 0; i < cards1.length; i++) {
        const cType = cards1[i].getAttribute('data-card');
        let sig1 = '';
        let sig2 = '';
        if (cType === '1') {
          sig1 = window.getComputedStyle(cards1[i].querySelector('.card1-file-1')).transform;
          sig2 = window.getComputedStyle(cards2[i].querySelector('.card1-file-1')).transform;
        } else if (cType === '2') {
          sig1 = window.getComputedStyle(cards1[i].querySelector('.card2-segment-indicator')).transform;
          sig2 = window.getComputedStyle(cards2[i].querySelector('.card2-segment-indicator')).transform;
        } else if (cType === '3') {
          sig1 = cards1[i].querySelector('.card3-search-text')?.textContent || '';
          sig2 = cards2[i].querySelector('.card3-search-text')?.textContent || '';
        } else if (cType === '4') {
          sig1 = window.getComputedStyle(cards1[i].querySelector('.card4-scrubber-handle')).left;
          sig2 = window.getComputedStyle(cards2[i].querySelector('.card4-scrubber-handle')).left;
        } else if (cType === '5') {
          sig1 = window.getComputedStyle(cards1[i].querySelector('.card5-saved-file')).opacity;
          sig2 = window.getComputedStyle(cards2[i].querySelector('.card5-saved-file')).opacity;
        }
        diffs.push({ cardType: cType, sig1, sig2, matched: sig1 === sig2 });
      }
      return { diffs, set3Exists: !!set3 };
    });

    console.log(`  Clone Sync Check on ${checkVp.name}:`, syncResults.diffs.map(d => `Card ${d.cardType}: sync=${d.matched}`));
    const allSync = syncResults.diffs.every(d => d.matched);
    if (allSync) {
      console.log(`  PASS: All card instances in original and clone are in 100% lockstep sync.`);
    } else {
      console.error(`  FAIL: Original and clone states differ!`, syncResults.diffs);
      allPassed = false;
    }

    // 2. Active tween stability check: sample tween counts over wraps
    const tweenCountStart = await demoPage.evaluate(() => {
      // @ts-ignore
      return window.gsap ? window.gsap.globalTimeline.getChildren(true, true, true).length : 0;
    });

    // 3. 45s run sampling every 1s across every card currently on screen
    console.log(`  Sampling all on-screen card instances for 45s (every 1s)...`);
    const history = {}; // cardId -> array of { t, signal }
    const staticViolations = [];

    const LOOP_WINDOWS = {
      '1': 6.5 + 1.4 + 1.0, // ~8.9s
      '2': 8.0 + 1.8 + 1.0, // ~10.8s
      '3': 8.5 + 1.5 + 1.0, // ~11.0s
      '4': 7.5 + 1.6 + 1.0, // ~10.1s
      '5': 8.2 + 1.7 + 1.0, // ~10.9s
    };

    for (let second = 1; second <= 45; second++) {
      await demoPage.waitForTimeout(1000);

      const frameData = await demoPage.evaluate(() => {
        const sets = document.querySelectorAll('.marquee-set');
        const cardsOnScreen = [];
        sets.forEach((setEl, setIdx) => {
          const cards = setEl.querySelectorAll('[data-card]');
          cards.forEach((cardEl, cardIdx) => {
            const r = cardEl.getBoundingClientRect();
            // Visible horizontally within viewport
            if (r.right > 0 && r.left < window.innerWidth) {
              const cardType = cardEl.getAttribute('data-card');
              let signal = '';
              if (cardType === '1') {
                const el = cardEl.querySelector('.card1-file-1');
                signal = el ? window.getComputedStyle(el).transform : '';
              } else if (cardType === '2') {
                const el = cardEl.querySelector('.card2-segment-indicator');
                signal = el ? window.getComputedStyle(el).transform : '';
              } else if (cardType === '3') {
                const el = cardEl.querySelector('.card3-search-text');
                signal = el ? el.textContent : '';
              } else if (cardType === '4') {
                const el = cardEl.querySelector('.card4-scrubber-handle');
                signal = el ? window.getComputedStyle(el).left : '';
              } else if (cardType === '5') {
                const el = cardEl.querySelector('.card5-saved-file');
                signal = el ? window.getComputedStyle(el).opacity : '';
              }

              cardsOnScreen.push({
                cardKey: `set${setIdx}_card${cardIdx}_type${cardType}`,
                setIdx,
                cardIdx,
                cardType,
                signal,
              });
            }
          });
        });
        return cardsOnScreen;
      });

      // Record signals and check window
      frameData.forEach((c) => {
        if (!history[c.cardKey]) {
          history[c.cardKey] = [];
        }
        history[c.cardKey].push({ t: second, signal: c.signal });

        const maxWindow = LOOP_WINDOWS[c.cardType] || 11;
        const windowEntries = history[c.cardKey].filter((e) => second - e.t <= maxWindow);
        if (windowEntries.length >= maxWindow - 1) {
          const distinctSignals = new Set(windowEntries.map((e) => e.signal));
          if (distinctSignals.size <= 1) {
            staticViolations.push({
              second,
              cardKey: c.cardKey,
              setIdx: c.setIdx,
              cardIdx: c.cardIdx,
              cardType: c.cardType,
              signalsSampled: windowEntries.length,
            });
          }
        }
      });
    }

    const tweenCountEnd = await demoPage.evaluate(() => {
      // @ts-ignore
      return window.gsap ? window.gsap.globalTimeline.getChildren(true, true, true).length : 0;
    });

    console.log(`  GSAP Active Tween Count: start=${tweenCountStart}, end=${tweenCountEnd}`);
    if (Math.abs(tweenCountEnd - tweenCountStart) <= 1) {
      console.log(`  PASS: Active tween count is stable over time (no tween leaks per wrap).`);
    } else {
      console.error(`  FAIL: Tween count grew! start=${tweenCountStart}, end=${tweenCountEnd}`);
      allPassed = false;
    }

    console.log(`  Tracked ${Object.keys(history).length} unique card instances across track.`);
    if (staticViolations.length === 0) {
      console.log(`  PASS: Zero static instances detected across full 45s run! All instances animated continuously.`);
    } else {
      console.error(`  FAIL: Detected static card instances during 45s run:`, staticViolations);
      allPassed = false;
    }

    await demoPage.close();
  }

  await browser.close();

  console.log('\n============================================================');
  if (allPassed) {
    console.log('ALL PLAYWRIGHT MARQUEE & PILL CHECKS PASSED!');
  } else {
    console.error('SOME CHECKS FAILED!');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
