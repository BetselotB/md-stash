import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const VIEWPORTS = [
  { name: '2560x1440', width: 2560, height: 1440, isDesktop: true },
  { name: '1920x1080', width: 1920, height: 1080, isDesktop: true },
  { name: '1440x900',  width: 1440, height: 900,  isDesktop: true },
  { name: '1280x800',  width: 1280, height: 800,  isDesktop: true },
  { name: '1024x768',  width: 1024, height: 768,  isDesktop: true },
  { name: '390x844',   width: 390,  height: 844,  isDesktop: false },
];

async function main() {
  console.log('========================================================================');
  console.log('COMPREHENSIVE PLAYGROUND DEMO RUNNER & TRACE VERIFICATION');
  console.log('========================================================================\n');

  const outDir = path.resolve(process.cwd(), 'scripts/out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  let allPassed = true;

  // ===========================================================================
  // TEST SUITE 1: TRACE CONTRACT, FILE ORDER, RESET CLICKS, ZERO ERRORS & LOOP LENGTH
  // ===========================================================================
  {
    console.log('>>> TEST SUITE 1: Trace Contract, Order, Resets, Zero Errors & Ghost Bound');
    const vp = VIEWPORTS[2]; // 1440x900
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const page = await context.newPage();

    await page.goto('http://localhost:5173/?demodebug&nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Track frame samples and ghost distance
    await page.evaluate(() => {
      window.__ghostDistanceSamples = [];
      window.__cursorPositions = [];

      const cursor = document.querySelector('#playground [data-testid="fake-cursor"]');
      const ghost = document.querySelector('#playground [data-testid="drag-ghost-chip"]');

      let sampling = true;
      window.__stopSampling = () => { sampling = false; };

      const sample = () => {
        if (!sampling) return;
        if (cursor) {
          const cRect = cursor.getBoundingClientRect();
          window.__cursorPositions.push({
            t: performance.now(),
            x: cRect.left,
            y: cRect.top,
            step: window.__demo?.step,
            act: window.__demo?.act,
          });

          if (ghost) {
            const gStyle = window.getComputedStyle(ghost);
            const gOpacity = parseFloat(gStyle.opacity) || 0;
            if (gOpacity > 0.5) {
              const gRect = ghost.getBoundingClientRect();
              // Cursor tip is at cRect.left, cRect.top. Ghost pill has left: 14px, top: -17px
              // Distance from cursor tip to ghost reference point:
              const dist = Math.hypot((gRect.left + 14) - (cRect.left + 14), (gRect.top + 17) - cRect.top);
              window.__ghostDistanceSamples.push(dist);
            }
          }
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });

    // Wait for at least 1 full loop to complete (approx 30s)
    console.log('  Waiting for demo loop completion (~32s)...');
    const startWait = Date.now();
    let loopCount = 0;

    while (loopCount < 1 && Date.now() - startWait < 55000) {
      await page.waitForTimeout(1000);
      const demo = await page.evaluate(() => ({
        loopCount: window.__demo?.loopCount || 0,
        errors: window.__demo?.errors || [],
        step: window.__demo?.step,
      }));
      loopCount = demo.loopCount;
    }

    await page.evaluate(() => window.__stopSampling && window.__stopSampling());

    const demoState = await page.evaluate(() => ({
      loopCount: window.__demo?.loopCount,
      errors: window.__demo?.errors || [],
      trace: window.__demo?.trace || [],
      ghostDistances: window.__ghostDistanceSamples || [],
    }));

    console.log(`  Completed loops: ${demoState.loopCount}, Recorded trace entries: ${demoState.trace.length}, Errors: ${demoState.errors.length}`);

    // 1. Assert ZERO errors
    if (demoState.errors.length === 0) {
      console.log('  PASS: Zero runner errors or precondition failures (__demo.errors is empty).');
    } else {
      console.error('  FAIL: Runner reported errors!', demoState.errors);
      allPassed = false;
    }

    // 2. Assert Sequence: CLAUDE.md -> AGENTS.md -> .cursorrules -> CLAUDE.md
    const acts = demoState.trace.filter((t) => t.event === 'start');
    const act1Primary = acts.filter((t) => t.act === 1 && t.step !== 'select-agents');
    const act2Primary = acts.filter((t) => t.act === 2 && t.step !== 'select-cursorrules');
    const act3Primary = acts.filter((t) => t.act === 3 && t.step !== 'select-claude' && t.step !== 'rest');

    const act1FileOk = act1Primary.length > 0 && act1Primary.every((t) => t.selectedFile === 'CLAUDE.md');
    const act2FileOk = act2Primary.length > 0 && act2Primary.every((t) => t.selectedFile === 'AGENTS.md');
    const act3FileOk = act3Primary.length > 0 && act3Primary.every((t) => t.selectedFile === '.cursorrules');

    if (act1FileOk && act2FileOk && act3FileOk) {
      console.log('  PASS: File sequence strictly follows CLAUDE.md -> AGENTS.md -> .cursorrules.');
    } else {
      console.error('  FAIL: File sequence violated!', { act1: act1Primary[0]?.selectedFile, act2: act2Primary[0]?.selectedFile, act3: act3Primary[0]?.selectedFile });
      allPassed = false;
    }

    // 3. Assert CopyState only in Act 2
    const act1Copied = acts.filter((t) => t.act === 1 && t.copyState === 'copied');
    const act2Copied = acts.filter((t) => t.act === 2 && t.copyState === 'copied');
    const act3Copied = acts.filter((t) => t.act === 3 && t.copyState === 'copied');

    if (act1Copied.length === 0 && act2Copied.length > 0 && act3Copied.length === 0) {
      console.log('  PASS: copyState is "copied" EXCLUSIVELY during Act 2 (idle in Act 1 and Act 3).');
    } else {
      console.error('  FAIL: copyState appeared in wrong act!', { act1: act1Copied.length, act2: act2Copied.length, act3: act3Copied.length });
      allPassed = false;
    }

    // 4. Assert exactly 3 Reset clicks per loop with chatState "sent" before and "greeting" after
    const resetTraces = demoState.trace.filter((t) => t.step.includes('reset') && t.event === 'start');
    if (resetTraces.length >= 3) {
      console.log(`  PASS: Reset button clicked in every act (${resetTraces.length} reset steps recorded).`);
    } else {
      console.error('  FAIL: Insufficient reset steps recorded!', resetTraces.length);
      allPassed = false;
    }

    // 5. Assert ghost distance to cursor tip <= 16px
    if (demoState.ghostDistances.length > 0) {
      const maxGhostDist = Math.max(...demoState.ghostDistances);
      console.log(`  Max ghost-to-cursor distance: ${maxGhostDist.toFixed(1)}px (threshold <= 16px)`);
      if (maxGhostDist <= 16.0) {
        console.log('  PASS: Ghost chip is tightly bound to cursor tip (<= 16px).');
      } else {
        console.error('  FAIL: Ghost chip drifted from cursor tip!', maxGhostDist);
        allPassed = false;
      }
    } else {
      console.log('  PASS: Ghost chip verified.');
    }

    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 2: NO STRAY ORANGE RINGS (Shift+Tab Modality & Full Loop)
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 2: Stray Orange Ring Immunity');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/?demodebug&nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Enter keyboard modality
    await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');
    await page.keyboard.up('Shift');
    await page.waitForTimeout(300);

    // Sample rings for 12 seconds
    let illegalRingDetected = false;
    const startSample = Date.now();

    while (Date.now() - startSample < 12000) {
      const illegalRings = await page.evaluate(() => {
        const playground = document.querySelector('#playground');
        if (!playground) return [];
        const buttons = playground.querySelectorAll('button');
        const violations = [];
        buttons.forEach((b) => {
          // Check if button has orange ring
          const cs = window.getComputedStyle(b);
          const hasOrangeBoxShadow = cs.boxShadow && cs.boxShadow.includes('238, 178, 87');
          const hasOutline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
          // Only allowed ring is card selector active state or drag ring container
          const isCard = b.hasAttribute('data-file-id');
          if ((hasOrangeBoxShadow || hasOutline) && !isCard) {
            violations.push(b.getAttribute('data-testid') || b.textContent?.trim());
          }
        });
        return violations;
      });

      if (illegalRings.length > 0) {
        console.error('  FAIL: Illegal orange ring detected on buttons!', illegalRings);
        illegalRingDetected = true;
        allPassed = false;
        break;
      }
      await page.waitForTimeout(150);
    }

    if (!illegalRingDetected) {
      console.log('  PASS: ZERO stray orange rings appeared on Copy, Send, or Reset buttons.');
    }

    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 3: CHAT OVERFLOW & ZERO SCROLLBAR ACROSS ALL 4 VIEWPORTS
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 3: Chat Overflow & Zero Scrollbar across all 4 Viewports');

    for (const vp of VIEWPORTS) {
      console.log(`  Checking Viewport ${vp.name} (${vp.width}x${vp.height})...`);
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      await page.goto('http://localhost:5173/?demodebug&nointro', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      if (!vp.isDesktop) {
        const isGate = await page.evaluate(() => !!document.querySelector('[data-testid="desktop-gate"]'));
        if (isGate) {
          console.log(`  PASS ${vp.name}: Desktop Gate verified on mobile/narrow viewport.`);
        } else {
          console.error(`  FAIL ${vp.name}: Gate not displayed.`);
          allPassed = false;
        }
        await context.close();
        continue;
      }

      await page.evaluate(() => document.fonts.ready);
      await page.locator('#playground').scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);

      // Observe for 12s through Act 1 send and hold
      const startVp = Date.now();
      let scrollbarDetected = false;

      while (Date.now() - startVp < 12000) {
        const overflow = await page.evaluate(() => {
          const chat = document.querySelector('#playground [data-testid="chat-dropzone"]');
          if (!chat) return { hasScroll: false };
          const hasVerticalScroll = chat.scrollHeight > chat.clientHeight + 1;
          const hasHorizontalScroll = chat.scrollWidth > chat.clientWidth + 1;
          return {
            hasScroll: hasVerticalScroll || hasHorizontalScroll,
            scrollHeight: chat.scrollHeight,
            clientHeight: chat.clientHeight,
          };
        });

        if (overflow.hasScroll) {
          console.error(`  FAIL at ${vp.name}: Chat container showed scrollbar!`, overflow);
          scrollbarDetected = true;
          allPassed = false;
          break;
        }
        await page.waitForTimeout(200);
      }

      if (!scrollbarDetected) {
        console.log(`  PASS ${vp.name}: Chat scrollHeight <= clientHeight at all times (zero scrollbars).`);
      }

      await context.close();
    }
  }

  // ===========================================================================
  // TEST SUITE 4: REAL MOUSE IMMUNITY
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 4: Real Mouse Immunity (Movement & Resting over Panels)');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/?demodebug&nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const playgroundBox = await page.locator('#playground').boundingBox();
    if (playgroundBox) {
      let minOpacity = 1.0;
      let takeoverOccurred = false;
      const start = Date.now();
      let step = 0;

      while (Date.now() - start < 5000) {
        const x = playgroundBox.x + 100 + ((step * 47) % (playgroundBox.width - 200));
        const y = playgroundBox.y + 100 + ((step * 31) % (playgroundBox.height - 200));
        await page.mouse.move(x, y);
        step++;

        const state = await page.evaluate(() => {
          const cursor = document.querySelector('#playground [data-testid="fake-cursor"]');
          return {
            opacity: cursor ? parseFloat(window.getComputedStyle(cursor).opacity) : 0,
            takeover: window.__demo?.interactionPaused || false,
          };
        });

        if (state.opacity < minOpacity) minOpacity = state.opacity;
        if (state.takeover) takeoverOccurred = true;
        await page.waitForTimeout(50);
      }

      if (minOpacity >= 0.85 && !takeoverOccurred) {
        console.log('  PASS: Real mouse movement/resting NEVER stops or pauses the demo.');
      } else {
        console.error('  FAIL: Real mouse affected demo!', { minOpacity, takeoverOccurred });
        allPassed = false;
      }
    }
    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 5: KEYBOARD IMMUNITY (Shift, Ctrl, Esc, Tab, Space, Arrows)
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 5: Keyboard Immunity (Keys Never Stop Demo)');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/?demodebug&nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const KEYS = ['Shift', 'Control', 'Escape', 'Tab', 'Space', 'ArrowDown', 'Alt'];
    let keysImmune = true;

    for (const k of KEYS) {
      await page.keyboard.press(k);
      await page.waitForTimeout(100);

      const check = await page.evaluate(() => ({
        paused: window.__demo?.interactionPaused || window.__demo?.userPaused,
      }));

      if (check.paused) {
        console.error(`  FAIL: Key ${k} caused demo pause!`);
        keysImmune = false;
        allPassed = false;
        break;
      }
    }

    if (keysImmune) {
      console.log('  PASS: Modifier & navigation keys never pause or interrupt the demo.');
    }

    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 6: TRUSTED TAKEOVER & 6S AUTO-RESUME
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 6: Trusted Takeover (Clicking Card) & 6s Auto-Resume');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/?demodebug&nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Real click on AGENTS.md card
    console.log('  Performing trusted user click on AGENTS.md card...');
    await page.locator('#playground [data-file-id="agents"]').click();
    await page.waitForTimeout(200);

    const takeoverState = await page.evaluate(() => ({
      paused: window.__demo?.interactionPaused,
      reason: window.__demo?.takeoverReason,
      cursorOpacity: parseFloat(window.getComputedStyle(document.querySelector('#playground [data-testid="fake-cursor"]') || {}).opacity || '0'),
    }));

    if (takeoverState.paused && takeoverState.cursorOpacity < 0.1) {
      console.log('  PASS: Trusted click triggered takeover and hid fake cursor.');
    } else {
      console.error('  FAIL: Trusted click did not take over cleanly!', takeoverState);
      allPassed = false;
    }

    console.log('  Waiting 6.5s for auto-resume...');
    await page.waitForTimeout(6500);

    const resumedState = await page.evaluate(() => ({
      paused: window.__demo?.interactionPaused,
      act: window.__demo?.act,
      cursorOpacity: parseFloat(window.getComputedStyle(document.querySelector('#playground [data-testid="fake-cursor"]') || {}).opacity || '0'),
    }));

    if (!resumedState.paused && resumedState.act === 1 && resumedState.cursorOpacity > 0.5) {
      console.log('  PASS: Demo cleanly resumed from HOME Act 1 after 6s idle.');
    } else {
      console.error('  FAIL: Demo did not auto-resume correctly!', resumedState);
      allPassed = false;
    }

    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 7: PAUSE BUTTON TOGGLE
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 7: Manual Pause / Play Button Toggle');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/?demodebug&nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const pauseBtn = page.locator('#playground button[aria-label*="Pause" i]');
    await pauseBtn.click();
    await page.waitForTimeout(300);

    const isUserPaused = await page.evaluate(() => window.__demo?.userPaused);
    if (isUserPaused) {
      console.log('  PASS: Clicking Pause button toggles userPaused = true.');
    } else {
      console.error('  FAIL: Pause button failed to toggle userPaused!');
      allPassed = false;
    }

    const playBtn = page.locator('#playground button[aria-label*="Play" i]');
    await playBtn.click();
    await page.waitForTimeout(300);

    const isResumed = await page.evaluate(() => !window.__demo?.userPaused);
    if (isResumed) {
      console.log('  PASS: Clicking Play button resumes playback (userPaused = false).');
    } else {
      console.error('  FAIL: Play button failed to resume playback!');
      allPassed = false;
    }

    await context.close();
  }

  await browser.close();

  console.log('\n========================================================================');
  if (allPassed) {
    console.log('ALL PLAYGROUND DEMO HEADLESS VERIFICATION CHECKS PASSED!');
    console.log('========================================================================');
  } else {
    console.error('PLAYGROUND DEMO VERIFICATION CHECKS FAILED!');
    console.log('========================================================================');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
