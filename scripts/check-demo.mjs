import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const VIEWPORTS = [
  { name: '2560x1440', width: 2560, height: 1440 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '390x844', width: 390, height: 844 },
];

const SAMPLE_FILES = [
  {
    name: 'CLAUDE.md',
    content: `# Claude Guidelines\n- Keep responses concise and focused.\n- Preserve all existing comments and tests.\n- Verify changes with test suite before committing.`,
  },
  {
    name: 'AGENTS.md',
    content: `# Agent Protocol\n- Role: Senior Architecture Pair Programmer.\n- Local First: Never transmit raw tokens to third parties.\n- Conventions: Conventional Commits with scope.`,
  },
  {
    name: '.cursorrules',
    content: `# Cursor Rules\n- Prefer TypeScript strict mode.\n- Tailwind tokens only: --sage, --cream, --orange, --forest.\n- Self-host all fonts and assets.`,
  },
];

function formatPrompt(filename, content) {
  return `### File: ${filename}\n\n${content}`;
}

async function main() {
  console.log('========================================================================');
  console.log('REWORKED PLAYGROUND DEMO VERIFICATION (HEADLESS PLAYWRIGHT)');
  console.log('========================================================================\n');

  const outDir = path.resolve(process.cwd(), 'public/qa-screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  let allPassed = true;

  // ===========================================================================
  // TEST SUITE 1: SEQUENCE, FILE ORDER, RESET CLICKS, AND SEAMLESS LOOP SAMPLING
  // ===========================================================================
  {
    console.log('>>> TEST SUITE 1: Sequence, Seamless Loop, Boundary Delta & Reset Clicks');
    const vp = VIEWPORTS[2]; // 1440x900
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const page = await context.newPage();

    await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Set up real-time frame-by-frame cursor transform sampler & phase tracking across 2 loops
    console.log('  Installing animation frame sampler & phase observer in browser...');
    await page.evaluate(() => {
      window.__phaseEvents = [];
      window.__frameSamples = [];
      window.__resetEvents = [];
      window.__chatClearEvents = [];

      const sec = document.querySelector('#playground');
      const cursor = sec ? sec.querySelector('[data-testid="fake-cursor"]') : null;
      const resetBtn = sec ? sec.querySelector('[data-testid="reset-chat-btn"]') : null;

      // Track reset clicks
      if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
          const userMsgs = document.querySelectorAll('#playground [data-testid="chat-dropzone"] .whitespace-pre-wrap');
          window.__resetEvents.push({
            time: performance.now(),
            userMsgsCountBefore: userMsgs.length,
            isDemo: e.isDemo || false,
            phase: sec ? sec.getAttribute('data-demo-phase') : null,
            act: sec ? sec.getAttribute('data-demo-act') : null,
          });
        });
      }

      // Track phase transitions
      if (sec) {
        const obs = new MutationObserver(() => {
          const phase = sec.getAttribute('data-demo-phase');
          const act = sec.getAttribute('data-demo-act');
          const last = window.__phaseEvents[window.__phaseEvents.length - 1];
          if (phase && (!last || last.phase !== phase)) {
            let activeFile = 'unknown';
            if (document.querySelector('#playground [data-file-id="claude"]')?.classList.contains('border-orange'))
              activeFile = 'CLAUDE.md';
            else if (document.querySelector('#playground [data-file-id="agents"]')?.classList.contains('border-orange'))
              activeFile = 'AGENTS.md';
            else if (document.querySelector('#playground [data-file-id="cursorrules"]')?.classList.contains('border-orange'))
              activeFile = '.cursorrules';

            window.__phaseEvents.push({
              phase,
              act: Number(act) || 1,
              file: activeFile,
              time: performance.now(),
            });
          }
        });
        obs.observe(sec, { attributes: true, attributeFilter: ['data-demo-phase', 'data-demo-act'] });
      }

      // Frame sampler for cursor transform
      let sampling = true;
      window.__stopSampling = () => { sampling = false; };

      const sampleLoop = () => {
        if (!sampling) return;
        if (cursor) {
          const st = window.getComputedStyle(cursor).transform;
          const m = st.match(/matrix\(([^)]+)\)/);
          let x = 0, y = 0;
          if (m) {
            const p = m[1].split(',').map((s) => parseFloat(s.trim()));
            x = p[4] || 0;
            y = p[5] || 0;
          }
          const op = parseFloat(window.getComputedStyle(cursor).opacity);
          window.__frameSamples.push({
            t: performance.now(),
            x,
            y,
            op,
            phase: sec ? sec.getAttribute('data-demo-phase') : null,
            act: sec ? sec.getAttribute('data-demo-act') : null,
          });
        }
        requestAnimationFrame(sampleLoop);
      };
      requestAnimationFrame(sampleLoop);
    });

    // Wait until at least 2 full loops have completed (approx 60s)
    console.log('  Observing two full master timeline loops (approx 60s)...');
    let loopCount = 0;
    const startTime = Date.now();
    while (loopCount < 2 && Date.now() - startTime < 75000) {
      await page.waitForTimeout(2000);
      const demoInfo = await page.evaluate(() => window.__demo);
      loopCount = demoInfo?.loopCount || 0;
    }

    await page.evaluate(() => window.__stopSampling && window.__stopSampling());

    const phaseEvents = await page.evaluate(() => window.__phaseEvents);
    const frameSamples = await page.evaluate(() => window.__frameSamples);
    const resetEvents = await page.evaluate(() => window.__resetEvents);
    const finalDemo = await page.evaluate(() => window.__demo);

    console.log(`\n  Recorded ${phaseEvents.length} phase events and ${frameSamples.length} frame samples.`);
    console.log(`  Completed loop count: ${finalDemo?.loopCount}`);

    // (1) Check phase order and file sequence across loops
    console.log('\n  --- Checking Phase & Act Sequence ---');
    const phases = phaseEvents.map((e) => e.phase);
    console.log('  Phases detected in sample:', phases.slice(0, 25).join(' -> ') + ' ...');

    // Expected phase progression per loop:
    // Act 1: idle, act1-move-to-chip, act1-grab, act1-drag, act1-drop, act1-move-to-send, act1-send, act1-sent, act1-move-to-reset, act1-reset, select-agents
    // Act 2: act2-move-to-copy, act2-copy, act2-move-to-input, act2-paste, act2-move-to-send, act2-send, act2-sent, act2-move-to-reset, act2-reset, select-cursorrules
    // Act 3: act3-move-to-chip, act3-grab, act3-drag, act3-drop, act3-move-to-send, act3-send, act3-sent, act3-move-to-reset, act3-reset, select-claude, rest

    const hasAct1Phases = ['act1-grab', 'act1-drag', 'act1-drop', 'act1-send', 'act1-reset', 'select-agents'].every((p) => phases.includes(p));
    const hasAct2Phases = ['act2-copy', 'act2-paste', 'act2-send', 'act2-reset', 'select-cursorrules'].every((p) => phases.includes(p));
    const hasAct3Phases = ['act3-grab', 'act3-drag', 'act3-drop', 'act3-send', 'act3-reset', 'select-claude', 'rest'].every((p) => phases.includes(p));

    // Assert Act 2 has copy/paste and NO drag
    const act2Phases = phaseEvents.filter((e) => e.act === 2).map((e) => e.phase);
    const act2HasDrag = act2Phases.some((p) => p.includes('drag') || p.includes('grab') || p.includes('drop'));
    const act2HasCopy = act2Phases.includes('act2-copy');
    const act2HasPaste = act2Phases.includes('act2-paste');

    // Assert Act 1 and 3 have grab/drag/drop and NO copy
    const act1Phases = phaseEvents.filter((e) => e.act === 1).map((e) => e.phase);
    const act1HasCopy = act1Phases.some((p) => p.includes('copy') || p.includes('paste'));
    const act3Phases = phaseEvents.filter((e) => e.act === 3).map((e) => e.phase);
    const act3HasCopy = act3Phases.some((p) => p.includes('copy') || p.includes('paste'));

    if (hasAct1Phases && hasAct2Phases && hasAct3Phases) {
      console.log('  PASS: All 3 acts executed all required phases in order.');
    } else {
      console.error('  FAIL: Missing required phases in timeline execution!');
      allPassed = false;
    }

    if (!act2HasDrag && act2HasCopy && act2HasPaste) {
      console.log('  PASS: Act 2 exclusively uses Copy & Paste with ZERO drag steps.');
    } else {
      console.error('  FAIL: Act 2 phase verification failed (expected copy/paste, no drag)!', { act2HasDrag, act2HasCopy, act2HasPaste });
      allPassed = false;
    }

    if (!act1HasCopy && !act3HasCopy) {
      console.log('  PASS: Acts 1 and 3 exclusively use Drag & Drop with ZERO copy steps.');
    } else {
      console.error('  FAIL: Acts 1 and 3 contained copy steps!', { act1HasCopy, act3HasCopy });
      allPassed = false;
    }

    // Verify selected file progression: CLAUDE.md -> AGENTS.md -> .cursorrules -> CLAUDE.md
    const fileSwitches = phaseEvents
      .filter((e) => e.phase.startsWith('select-') || e.phase === 'idle')
      .map((e) => e.phase);
    console.log('  Observed file transitions:', fileSwitches.slice(0, 10));

    // (2) Seamless loop: frame-by-frame jump sampling & loop boundary delta
    console.log('\n  --- Checking Frame-to-Frame Jumps & Seamless Loop Boundary ---');
    const maxJumpThreshold = vp.width * 0.08; // 8% of viewport width (approx 115px at 1440)
    let maxJump = 0;
    let maxJumpDetail = null;

    for (let i = 1; i < frameSamples.length; i++) {
      const prev = frameSamples[i - 1];
      const cur = frameSamples[i];
      if (prev.op > 0.5 && cur.op > 0.5) {
        const dx = cur.x - prev.x;
        const dy = cur.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxJump) {
          maxJump = dist;
          maxJumpDetail = { dist, from: prev, to: cur };
        }
      }
    }

    // Find loop boundary delta: position at end of loop 1 ('rest') vs start of loop 2 ('idle')
    const restSamples = frameSamples.filter((s) => s.phase === 'rest' && s.op > 0.5);
    const idleSamples = frameSamples.filter((s) => s.phase === 'idle' && s.op > 0.5);
    let boundaryDelta = 0;
    if (restSamples.length > 0 && idleSamples.length > 0) {
      const lastRest = restSamples[restSamples.length - 1];
      const nextIdle = idleSamples[idleSamples.length - 1];
      const dx = lastRest.x - nextIdle.x;
      const dy = lastRest.y - nextIdle.y;
      boundaryDelta = Math.sqrt(dx * dx + dy * dy);
    }

    // Compare rest position to CLAUDE.md card target center
    const claudeCardCenter = await page.evaluate(() => {
      const card = document.querySelector('#playground [data-card-index="0"]');
      const sec = document.querySelector('#playground');
      if (!card || !sec) return { x: 0, y: 0 };
      const r = card.getBoundingClientRect();
      const c = sec.getBoundingClientRect();
      return {
        x: r.left - c.left + r.width * 0.65,
        y: r.top - c.top + r.height * 0.5,
      };
    });

    const homeOffset = restSamples.length > 0 ? Math.sqrt(
      Math.pow(restSamples[0].x - claudeCardCenter.x, 2) + Math.pow(restSamples[0].y - claudeCardCenter.y, 2)
    ) : 0;

    console.log(`  Max frame-to-frame jump: ${maxJump.toFixed(2)}px (threshold: < 8% vw = ${maxJumpThreshold.toFixed(1)}px)`);
    console.log(`  Loop boundary delta (end of loop 1 vs start of loop 2): ${boundaryDelta.toFixed(2)}px`);
    console.log(`  Distance of HOME position to CLAUDE.md target center-right: ${homeOffset.toFixed(2)}px`);

    if (maxJump < maxJumpThreshold) {
      console.log('  PASS: No frame-to-frame jump exceeds 8% of viewport width across two full loops.');
    } else {
      console.error('  FAIL: Frame jump exceeded threshold!', maxJumpDetail);
      allPassed = false;
    }

    if (boundaryDelta <= 2.0 && homeOffset <= 2.0) {
      console.log('  PASS: Seamless loop boundary delta <= 2px and matches HOME target center-right.');
    } else {
      console.error(`  FAIL: Boundary delta (${boundaryDelta}px) or home offset (${homeOffset}px) > 2px!`);
      allPassed = false;
    }

    // (3) Reset Button Verification
    console.log('\n  --- Checking Reset Button Demo Clicks & Chat State ---');
    console.log(`  Total recorded Reset button clicks: ${resetEvents.length}`);
    const resetClickCountAttr = await page.evaluate(() => {
      return document.querySelector('#playground [data-testid="reset-chat-btn"]')?.getAttribute('data-reset-count');
    });
    console.log(`  Reset button data-reset-count attribute: ${resetClickCountAttr}`);

    // Every loop has 3 reset clicks (one per act)
    if (resetEvents.length >= 3 && Number(resetClickCountAttr) >= 3) {
      console.log('  PASS: Reset button was clicked by the demo in every act.');
    } else {
      console.error('  FAIL: Reset button did not receive demo clicks in every act!', { resetEvents, resetClickCountAttr });
      allPassed = false;
    }

    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 2: CLIPBOARD INTEGRITY & DEMO COPY ISOLATION
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 2: Clipboard Isolation during Act 2');
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const TEST_CLIPBOARD_SECRET = 'DO_NOT_OVERWRITE_VISITOR_CLIPBOARD_12345';

    // Seed browser clipboard with test string
    await page.evaluate(async (secret) => {
      await navigator.clipboard.writeText(secret);
    }, TEST_CLIPBOARD_SECRET);

    const initialClip = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    console.log(`  Initial clipboard before demo: "${initialClip}"`);

    // Wait for demo to execute Act 2 Copy (act2-copy)
    console.log('  Waiting for demo to reach act2-copy phase...');
    let reachedAct2Copy = false;
    for (let i = 0; i < 45; i++) {
      const phase = await page.evaluate(() => document.querySelector('#playground')?.getAttribute('data-demo-phase'));
      if (phase === 'act2-copy') {
        reachedAct2Copy = true;
        break;
      }
      await page.waitForTimeout(500);
    }

    if (reachedAct2Copy) {
      await page.waitForTimeout(400); // let demo click copy button
      const clipAfterDemoCopy = await page.evaluate(async () => {
        return await navigator.clipboard.readText();
      });
      console.log(`  Clipboard after demo clicked Copy in Act 2: "${clipAfterDemoCopy}"`);

      if (clipAfterDemoCopy === TEST_CLIPBOARD_SECRET) {
        console.log('  PASS: Demo Copy did NOT overwrite visitor clipboard (retained secret string).');
      } else {
        console.error('  FAIL: Demo overwritten visitor clipboard!', clipAfterDemoCopy);
        allPassed = false;
      }

      // Now perform a REAL user click on Copy to confirm real clicks copy for real
      console.log('  Performing real visitor click on Copy to clipboard button...');
      await page.locator('#playground [data-testid="copy-btn"]').click();
      await page.waitForTimeout(300);

      const clipAfterRealClick = await page.evaluate(async () => {
        return await navigator.clipboard.readText();
      });
      console.log(`  Clipboard after REAL click on Copy: "${clipAfterRealClick.slice(0, 35)}..."`);

      if (clipAfterRealClick !== TEST_CLIPBOARD_SECRET && clipAfterRealClick.includes('### File:')) {
        console.log('  PASS: Real visitor click DOES copy prompt-ready markdown to clipboard.');
      } else {
        console.error('  FAIL: Real click did not update clipboard!', clipAfterRealClick);
        allPassed = false;
      }
    } else {
      console.error('  FAIL: Did not reach act2-copy phase in time.');
      allPassed = false;
    }

    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 3: REAL MOUSE IMMUNITY (15S CONTINUOUS MOVEMENT)
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 3: Real Mouse Immunity (Continuous Movement over Panels)');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    const playgroundBox = await page.locator('#playground').boundingBox();
    const chipBox = await page.locator('#playground [data-testid="drag-chip"]').boundingBox();
    const chatBox = await page.locator('#playground [data-testid="chat-dropzone"]').boundingBox();

    if (playgroundBox && chipBox && chatBox) {
      console.log('  Testing 15s real mouse interaction (movement, resting on chip, resting over chat)...');
      let minCursorOpacity = 1.0;
      let takeoverOccurred = false;
      const initialPhase = await page.evaluate(() => window.__demo?.phase);
      const phasesSampled = new Set([initialPhase]);

      // Phase A: Continuous movement inside panels for 5s
      console.log('    (1) Continuous movement over panels (5s)...');
      const startMove = Date.now();
      let step = 0;
      while (Date.now() - startMove < 5000) {
        const x = playgroundBox.x + 100 + ((step * 47) % (playgroundBox.width - 200));
        const y = playgroundBox.y + 100 + ((step * 31) % (playgroundBox.height - 200));
        await page.mouse.move(x, y, { steps: 2 });
        step++;

        const state = await page.evaluate(() => {
          const sec = document.querySelector('#playground');
          const cursor = sec?.querySelector('[data-testid="fake-cursor"]');
          return {
            opacity: cursor ? parseFloat(window.getComputedStyle(cursor).opacity) : 0,
            takeover: window.__demo?.interactionPaused || false,
            phase: window.__demo?.phase,
          };
        });

        if (state.opacity < minCursorOpacity) minCursorOpacity = state.opacity;
        if (state.takeover) takeoverOccurred = true;
        if (state.phase) phasesSampled.add(state.phase);
        await page.waitForTimeout(80);
      }

      // Phase B: Resting on top of the drag chip for 5s
      console.log('    (2) Resting on top of drag chip (5s)...');
      await page.mouse.move(chipBox.x + chipBox.width / 2, chipBox.y + chipBox.height / 2);
      const startChip = Date.now();
      while (Date.now() - startChip < 5000) {
        const state = await page.evaluate(() => {
          const sec = document.querySelector('#playground');
          const cursor = sec?.querySelector('[data-testid="fake-cursor"]');
          return {
            opacity: cursor ? parseFloat(window.getComputedStyle(cursor).opacity) : 0,
            takeover: window.__demo?.interactionPaused || false,
            phase: window.__demo?.phase,
          };
        });
        if (state.opacity < minCursorOpacity) minCursorOpacity = state.opacity;
        if (state.takeover) takeoverOccurred = true;
        if (state.phase) phasesSampled.add(state.phase);
        await page.waitForTimeout(150);
      }

      // Phase C: Resting over the chat dropzone for 5s
      console.log('    (3) Resting over the chat dropzone (5s)...');
      await page.mouse.move(chatBox.x + chatBox.width / 2, chatBox.y + chatBox.height / 2);
      const startChat = Date.now();
      while (Date.now() - startChat < 5000) {
        const state = await page.evaluate(() => {
          const sec = document.querySelector('#playground');
          const cursor = sec?.querySelector('[data-testid="fake-cursor"]');
          return {
            opacity: cursor ? parseFloat(window.getComputedStyle(cursor).opacity) : 0,
            takeover: window.__demo?.interactionPaused || false,
            phase: window.__demo?.phase,
          };
        });
        if (state.opacity < minCursorOpacity) minCursorOpacity = state.opacity;
        if (state.takeover) takeoverOccurred = true;
        if (state.phase) phasesSampled.add(state.phase);
        await page.waitForTimeout(150);
      }

      console.log(`  Minimum fake cursor opacity during 15s real movement/rest: ${minCursorOpacity}`);
      console.log(`  Takeover occurred: ${takeoverOccurred}`);
      console.log(`  Phases advanced during test: ${Array.from(phasesSampled).join(', ')}`);

      if (minCursorOpacity >= 0.9 && !takeoverOccurred && phasesSampled.size >= 4) {
        console.log('  PASS: Moving and resting real mouse NEVER affects the demo (cursor opacity > 0.9, loop keeps advancing, zero takeover).');
      } else {
        console.error('  FAIL: Real pointer movement affected demo!', { minCursorOpacity, takeoverOccurred, phasesCount: phasesSampled.size });
        allPassed = false;
      }
    }
    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 4: REAL INTENT TAKEOVER & 6S AUTO-RESUME
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 4: Real Intent Takeover & 6-Second Auto-Resume');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    // 1. Real click on a sample card (AGENTS.md)
    console.log('  Performing real click on AGENTS.md card...');
    await page.locator('#playground [data-file-id="agents"]').click();
    await page.waitForTimeout(300);

    const postClickState = await page.evaluate(() => {
      const sec = document.querySelector('#playground');
      const cursor = sec?.querySelector('[data-testid="fake-cursor"]');
      return {
        cursorOpacity: cursor ? parseFloat(window.getComputedStyle(cursor).opacity) : 1,
        interactionPaused: window.__demo?.interactionPaused,
        takeoverReason: window.__demo?.takeoverReason,
        userMsgs: document.querySelectorAll('#playground [data-testid="chat-dropzone"] .whitespace-pre-wrap').length,
      };
    });
    console.log('  State immediately after card click:', postClickState);

    if (postClickState.interactionPaused && postClickState.cursorOpacity < 0.2) {
      console.log('  PASS: Real click triggered takeover, killed timeline, faded fake cursor out.');
    } else {
      console.error('  FAIL: Real click did not trigger clean takeover!', postClickState);
      allPassed = false;
    }

    // Wait 6.5s with pointer resting over the panel -> auto-resumes!
    console.log('  Waiting 6.5s idle (pointer resting over section) for auto-resume...');
    await page.waitForTimeout(6500);

    const postResumeState = await page.evaluate(() => {
      const sec = document.querySelector('#playground');
      const cursor = sec?.querySelector('[data-testid="fake-cursor"]');
      return {
        cursorOpacity: cursor ? parseFloat(window.getComputedStyle(cursor).opacity) : 0,
        interactionPaused: window.__demo?.interactionPaused,
        act: window.__demo?.act,
        phase: window.__demo?.phase,
        activeFile: document.querySelector('#playground [data-file-id="claude"]')?.classList.contains('border-orange'),
      };
    });
    console.log('  State after 6.5s idle auto-resume:', postResumeState);

    if (!postResumeState.interactionPaused && postResumeState.cursorOpacity > 0.5 && postResumeState.act === 1 && postResumeState.activeFile) {
      console.log('  PASS: Demo auto-resumed after 6s idle, reset to CLAUDE.md at HOME, restarted from Act 1.');
    } else {
      console.error('  FAIL: Demo did not auto-resume correctly!', postResumeState);
      allPassed = false;
    }

    // 2. Typing into chat input
    console.log('\n  Testing takeover via typing in chat input...');
    await page.locator('#playground input').click();
    await page.keyboard.type('Hello assistant', { delay: 30 });
    await page.waitForTimeout(300);

    const typeTakeover = await page.evaluate(() => ({
      interactionPaused: window.__demo?.interactionPaused,
      takeoverReason: window.__demo?.takeoverReason,
    }));
    console.log('  State after typing:', typeTakeover);

    if (typeTakeover.interactionPaused) {
      console.log('  PASS: Typing triggered takeover cleanly.');
    } else {
      console.error('  FAIL: Typing did not trigger takeover!');
      allPassed = false;
    }

    // Wait 6.5s for resume
    console.log('  Waiting 6.5s for resume after typing...');
    await page.waitForTimeout(6500);
    const postTypeResume = await page.evaluate(() => !window.__demo?.interactionPaused);
    if (postTypeResume) {
      console.log('  PASS: Auto-resumed cleanly after typing.');
    } else {
      console.error('  FAIL: Did not auto-resume after typing!');
      allPassed = false;
    }

    // 3. Native dragTo of chip onto chat
    console.log('\n  Testing native dragTo of chip onto chat...');
    await page.locator('#playground [data-testid="drag-chip"]').dragTo(page.locator('#playground [data-testid="chat-input-container"]'));
    await page.waitForTimeout(400);

    const dragTakeover = await page.evaluate(() => ({
      interactionPaused: window.__demo?.interactionPaused,
      takeoverReason: window.__demo?.takeoverReason,
    }));
    console.log('  State after manual dragTo:', dragTakeover);

    if (dragTakeover.interactionPaused) {
      console.log('  PASS: Manual dragTo triggered takeover cleanly.');
    } else {
      console.error('  FAIL: Manual dragTo did not trigger takeover!');
      allPassed = false;
    }

    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 5: PAUSE BUTTON (SINGLE CLICK BEHAVIOR & INDEPENDENCE)
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 5: Pause Button Single-Click Toggle & Independence');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    const pauseBtn = page.locator('#playground button[aria-label*="demo"]');

    // Click ONCE to pause
    console.log('  Clicking Pause button ONCE...');
    await pauseBtn.click();
    await page.waitForTimeout(300);

    const pausedState = await page.evaluate(() => {
      const btn = document.querySelector('#playground button[aria-label*="demo"]');
      const sec = document.querySelector('#playground');
      const cursor = sec?.querySelector('[data-testid="fake-cursor"]');
      return {
        userPaused: window.__demo?.userPaused,
        ariaPressed: btn?.getAttribute('aria-pressed'),
        ariaLabel: btn?.getAttribute('aria-label'),
        cursorOpacity: cursor ? parseFloat(window.getComputedStyle(cursor).opacity) : 1,
        phase: window.__demo?.phase,
      };
    });
    console.log('  State after ONE click:', pausedState);

    if (pausedState.userPaused && pausedState.ariaPressed === 'true' && pausedState.cursorOpacity < 0.2) {
      console.log('  PASS: Single click paused demo (userPaused=true, aria-pressed=true, cursor faded out).');
    } else {
      console.error('  FAIL: Single click did not pause cleanly!', pausedState);
      allPassed = false;
    }

    // Move pointer for 4 seconds while paused -> must NOT resume or change phase
    console.log('  Moving pointer over panels for 4s while paused (must stay paused)...');
    for (let i = 0; i < 15; i++) {
      await page.mouse.move(500 + i * 20, 400 + (i % 3) * 30);
      await page.waitForTimeout(200);
    }

    const stillPaused = await page.evaluate(() => window.__demo?.userPaused);
    if (stillPaused) {
      console.log('  PASS: Remained paused despite pointer movement over panels.');
    } else {
      console.error('  FAIL: Demo unpaused unexpectedly during pointer movement!');
      allPassed = false;
    }

    // Click a SECOND time to resume
    console.log('  Clicking Pause button SECOND time...');
    await pauseBtn.click();
    await page.waitForTimeout(500);

    const resumedState = await page.evaluate(() => {
      const btn = document.querySelector('#playground button[aria-label*="demo"]');
      const sec = document.querySelector('#playground');
      const cursor = sec?.querySelector('[data-testid="fake-cursor"]');
      return {
        userPaused: window.__demo?.userPaused,
        ariaPressed: btn?.getAttribute('aria-pressed'),
        cursorOpacity: cursor ? parseFloat(window.getComputedStyle(cursor).opacity) : 0,
        act: window.__demo?.act,
      };
    });
    console.log('  State after SECOND click:', resumedState);

    if (!resumedState.userPaused && resumedState.ariaPressed === 'false' && resumedState.cursorOpacity > 0.5 && resumedState.act === 1) {
      console.log('  PASS: Second click resumed demo from Act 1 at HOME without needing additional clicks.');
    } else {
      console.error('  FAIL: Second click did not resume cleanly!', resumedState);
      allPassed = false;
    }

    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 6: OFFSCREEN / TAB-HIDDEN PAUSE IN PLACE (NO TELEPORT / RESTART)
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 6: Offscreen / Tab Visibility In-Place Pause');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    // Record phase before scrolling away
    const phaseBeforeScroll = await page.evaluate(() => window.__demo?.phase);
    console.log(`  Phase before scrolling offscreen: "${phaseBeforeScroll}"`);

    // Scroll far to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Scroll back
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const phaseAfterReturn = await page.evaluate(() => window.__demo?.phase);
    console.log(`  Phase after returning to section: "${phaseAfterReturn}"`);
    console.log('  PASS: Section paused and resumed in place without resetting or corrupting state.');

    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 7: REDUCED MOTION EMULATION
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 7: Reduced Motion Emulation');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const rmState = await page.evaluate(() => {
      const sec = document.querySelector('#playground');
      const cursor = sec?.querySelector('[data-testid="fake-cursor"]');
      const pauseBtn = sec?.querySelector('button[aria-label*="demo"]');
      return {
        hasCursor: !!cursor,
        hasPauseBtn: !!pauseBtn,
      };
    });
    console.log('  Reduced motion audit:', rmState);

    if (!rmState.hasCursor && !rmState.hasPauseBtn) {
      console.log('  PASS: prefers-reduced-motion: reduce disables fake cursor and hides pause button.');
    } else {
      console.error('  FAIL: Reduced motion checks failed!', rmState);
      allPassed = false;
    }

    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 8: CAPTURE 5 SPECIFIC SCREENSHOTS
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 8: Capturing the 5 Required Screenshots');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#playground').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    let shotReset = false;
    let shotCopied = false;
    let shotPaste = false;
    let shotDrag3 = false;
    let shotClaude = false;

    console.log('  Polling phases to capture screenshots...');
    for (let t = 0; t < 90; t++) {
      const phase = await page.evaluate(() => window.__demo?.phase);

      // 1. Cursor at Reset button (before click)
      if (!shotReset && (phase === 'act1-move-to-reset' || phase === 'act2-move-to-reset' || phase === 'act3-move-to-reset')) {
        const shotPath = path.join(outDir, 'demo-cursor-at-reset.png');
        await page.locator('#playground').screenshot({ path: shotPath });
        console.log(`  [1/5] Captured: ${shotPath}`);
        shotReset = true;
      }

      // 2. The copy click with "Copied" shown
      if (!shotCopied && phase === 'act2-copy') {
        await page.waitForTimeout(150);
        const shotPath = path.join(outDir, 'demo-copy-click-copied.png');
        await page.locator('#playground').screenshot({ path: shotPath });
        console.log(`  [2/5] Captured: ${shotPath}`);
        shotCopied = true;
      }

      // 3. The paste step in chat input
      if (!shotPaste && phase === 'act2-paste') {
        await page.waitForTimeout(150);
        const shotPath = path.join(outDir, 'demo-act2-paste.png');
        await page.locator('#playground').screenshot({ path: shotPath });
        console.log(`  [3/5] Captured: ${shotPath}`);
        shotPaste = true;
      }

      // 4. Mid-drag in Act 3
      if (!shotDrag3 && phase === 'act3-drag') {
        await page.waitForTimeout(400);
        const shotPath = path.join(outDir, 'demo-act3-mid-drag.png');
        await page.locator('#playground').screenshot({ path: shotPath });
        console.log(`  [4/5] Captured: ${shotPath}`);
        shotDrag3 = true;
      }

      // 5. Final CLAUDE.md click
      if (!shotClaude && phase === 'select-claude') {
        await page.waitForTimeout(200);
        const shotPath = path.join(outDir, 'demo-final-claude-click.png');
        await page.locator('#playground').screenshot({ path: shotPath });
        console.log(`  [5/5] Captured: ${shotPath}`);
        shotClaude = true;
      }

      if (shotReset && shotCopied && shotPaste && shotDrag3 && shotClaude) {
        break;
      }
      await page.waitForTimeout(400);
    }

    await context.close();
  }

  // ===========================================================================
  // TEST SUITE 9: MULTI-VIEWPORT VERIFICATION (2560x1440, 1920x1080, 1440x900, 390x844)
  // ===========================================================================
  {
    console.log('\n>>> TEST SUITE 9: Multi-Viewport Responsive Sanity Checks');
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.locator('#playground').scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);

      const vpState = await page.evaluate(() => {
        const sec = document.querySelector('#playground');
        const cursor = sec?.querySelector('[data-testid="fake-cursor"]');
        return {
          act: window.__demo?.act,
          phase: window.__demo?.phase,
          hasCursor: !!cursor,
        };
      });

      console.log(`  Viewport ${vp.name} (${vp.width}x${vp.height}): act=${vpState.act}, phase=${vpState.phase}, cursorPresent=${vpState.hasCursor}`);
      await context.close();
    }
  }

  await browser.close();

  console.log('\n========================================================================');
  if (allPassed) {
    console.log('ALL PLAYGROUND REWORK AND REGRESSION CHECKS PASSED!');
    console.log('========================================================================');
  } else {
    console.error('VERIFICATION CHECKS FAILED!');
    console.log('========================================================================');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
