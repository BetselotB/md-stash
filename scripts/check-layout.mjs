import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

function checkIntersect(r1, r2) {
  return !(
    r2.left >= r1.right ||
    r2.right <= r1.left ||
    r2.top >= r1.bottom ||
    r2.bottom <= r1.top
  );
}

async function runCheck() {
  console.log('=== RUNNING HERO POLISH & LAYOUT VERIFICATION ===\n');

  const outDir = path.resolve('public/qa-screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: '2560x1440', width: 2560, height: 1440, isDesktop: true },
    { name: '1920x1080', width: 1920, height: 1080, isDesktop: true },
    { name: '1440x900',  width: 1440, height: 900,  isDesktop: true },
    { name: '1280x800',  width: 1280, height: 800,  isDesktop: true },
    { name: '1024x768',  width: 1024, height: 768,  isDesktop: true },
    { name: '390x844',   width: 390,  height: 844,  isDesktop: false },
  ];

  let allPassed = true;

  for (const vp of viewports) {
    console.log(`\n================ Viewport: ${vp.name} ================`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2, // 2x scale for crisp crops and visual fidelity
    });

    await page.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    if (!vp.isDesktop) {
      const isGate = await page.evaluate(() => !!document.querySelector('[data-testid="desktop-gate"]'));
      if (isGate) {
        console.log(`✓ PASS: Gate page verified at ${vp.name}`);
      } else {
        console.error(`FAIL: Gate not displayed at ${vp.name}`);
        allPassed = false;
      }
      await page.close();
      continue;
    }

    // 1. Measure headline and longest line span
    const headlineMetrics = await page.evaluate(() => {
      const h1 = document.querySelector('.hero-headline');
      const lines = Array.from(document.querySelectorAll('.hero-line'));
      const line1 = document.querySelector('.hero-line-1');

      const h1Rect = h1 ? h1.getBoundingClientRect() : null;
      let maxLineWidth = 0;
      let line1Width = 0;

      lines.forEach((l) => {
        const r = l.getBoundingClientRect();
        if (r.width > maxLineWidth) maxLineWidth = r.width;
      });

      if (line1) {
        line1Width = line1.getBoundingClientRect().width;
      }

      return {
        h1Rect: h1Rect ? {
          top: Math.round(h1Rect.top),
          bottom: Math.round(h1Rect.bottom),
          left: Math.round(h1Rect.left),
          right: Math.round(h1Rect.right),
          width: Math.round(h1Rect.width),
          height: Math.round(h1Rect.height),
        } : null,
        maxLineWidth,
        line1Width,
      };
    });

    const longestLineSpanPct = parseFloat(((headlineMetrics.maxLineWidth / vp.width) * 100).toFixed(1));
    console.log(`  Headline longest line width: ${headlineMetrics.maxLineWidth.toFixed(0)}px (${longestLineSpanPct}% of viewport width)`);

    if (vp.width === 2560) {
      if (longestLineSpanPct >= 66.0 && longestLineSpanPct <= 70.0) {
        console.log(`  PASS: Headline longest line is ${longestLineSpanPct}%, within target range [66.0% - 70.0%].`);
      } else {
        console.error(`  FAIL: Headline longest line is ${longestLineSpanPct}%, expected between 66.0% and 70.0%!`);
        allPassed = false;
      }
    }

    // 2. Check ancestor clipping for all headline lines
    const clippingCheck = await page.evaluate(() => {
      const lines = Array.from(document.querySelectorAll('.hero-line'));
      const hero = document.querySelector('section');
      const issues = [];

      lines.forEach((line, idx) => {
        let curr = line;
        while (curr && curr !== document.body) {
          const cs = window.getComputedStyle(curr);
          if (cs.overflow !== 'visible') {
            issues.push(`Line ${idx + 1} ancestor <${curr.tagName.toLowerCase()} class="${curr.className}"> has overflow: ${cs.overflow}`);
          }
          if (cs.clipPath && cs.clipPath !== 'none') {
            issues.push(`Line ${idx + 1} ancestor <${curr.tagName.toLowerCase()} class="${curr.className}"> has clipPath: ${cs.clipPath}`);
          }
          if (curr === hero) break;
          curr = curr.parentElement;
        }
      });

      return issues;
    });

    if (clippingCheck.length === 0) {
      console.log('  PASS: No headline text ancestor up to hero has overflow != visible or clip-path != none.');
    } else {
      console.error('  FAIL: Clipping issues detected on headline ancestors:');
      clippingCheck.forEach((iss) => console.error(`    - ${iss}`));
      allPassed = false;
    }

    // 3. Collect bounding boxes of all hero elements and check pairwise non-intersection & viewport containment
    const layoutElements = await page.evaluate(() => {
      const items = [
        { name: 'Headline Box', sel: '.hero-headline' },
        { name: 'Asterisk Group', sel: '.hero-asterisk-group' },
        { name: 'Crate & Arch Container', sel: '.hero-crate-container' },
        { name: 'Scroll Cue', sel: '.hero-scroll-cue' },
        { name: 'Right-edge Tab', sel: '.hero-right-tab' },
        { name: 'Prompt Group', sel: '.hero-motif-right' },
        { name: 'Nav Badge', sel: '.nav-badge' },
      ];

      return items.map(({ name, sel }) => {
        const el = document.querySelector(sel);
        if (!el) return { name, exists: false };
        const cs = window.getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') {
          return { name, exists: false, hidden: true };
        }
        const r = el.getBoundingClientRect();
        return {
          name,
          exists: true,
          rect: {
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            left: Math.round(r.left),
            right: Math.round(r.right),
            width: Math.round(r.width),
            height: Math.round(r.height),
          },
        };
      });
    });

    console.log('  Bounding box coordinates:');
    layoutElements.forEach((el) => {
      if (el.exists) {
        console.log(`    - ${el.name.padEnd(24)}: [left: ${el.rect.left}, top: ${el.rect.top}, right: ${el.rect.right}, bottom: ${el.rect.bottom}, width: ${el.rect.width}, height: ${el.rect.height}]`);
      } else {
        console.log(`    - ${el.name.padEnd(24)}: [hidden / not displayed at this viewport]`);
      }
    });

    // Check viewport containment
    let vpContainmentFailed = false;
    layoutElements.forEach((el) => {
      if (!el.exists) return;
      const r = el.rect;
      // Allow minor subpixel tolerance (-2 to +2)
      if (r.left < -2 || r.right > vp.width + 2 || r.top < -2 || r.bottom > vp.height + 2) {
        console.error(`  FAIL: ${el.name} is outside viewport bounds! [0..${vp.width}, 0..${vp.height}], got: ${JSON.stringify(r)}`);
        vpContainmentFailed = true;
        allPassed = false;
      }
    });
    if (!vpContainmentFailed) {
      console.log('  PASS: All visible hero elements are inside viewport bounds.');
    }

    // Pairwise non-intersection check among all active hero elements
    let collisionDetected = false;
    for (let i = 0; i < layoutElements.length; i++) {
      for (let j = i + 1; j < layoutElements.length; j++) {
        const a = layoutElements[i];
        const b = layoutElements[j];
        if (!a.exists || !b.exists) continue;

        if (checkIntersect(a.rect, b.rect)) {
          console.error(`  FAIL: Intersection detected between ${a.name} and ${b.name}!`);
          console.error(`        ${a.name}: ${JSON.stringify(a.rect)}`);
          console.error(`        ${b.name}: ${JSON.stringify(b.rect)}`);
          collisionDetected = true;
          allPassed = false;
        }
      }
    }
    if (!collisionDetected) {
      console.log('  PASS: Zero collisions between any hero elements at this viewport.');
    }

    // 4. Capture 2x full hero screenshot
    const heroShot = path.join(outDir, `hero-${vp.name}.png`);
    await page.screenshot({ path: heroShot, fullPage: false });
    console.log(`  Saved full hero screenshot: ${heroShot}`);

    // 5. Capture 2x crops for detail verification
    // Crop A: "Y" of line 1
    const line1El = await page.$('.hero-line-1');
    if (line1El) {
      const l1Box = await line1El.boundingBox();
      if (l1Box) {
        const yCropShot = path.join(outDir, `crop-Y-${vp.name}.png`);
        await page.screenshot({
          path: yCropShot,
          clip: {
            x: Math.max(0, l1Box.x - 10),
            y: Math.max(0, l1Box.y - 10),
            width: Math.min(vp.width - l1Box.x, Math.max(80, l1Box.height * 1.3)),
            height: Math.min(vp.height - l1Box.y, l1Box.height + 20),
          },
        });
        console.log(`  Saved 2x crop of "Y": ${yCropShot}`);
      }
    }

    // Crop B: Comma after "markdown"
    const hlMarkdownEl = await page.$('.hl-markdown');
    if (hlMarkdownEl) {
      const mBox = await hlMarkdownEl.boundingBox();
      if (mBox) {
        const commaShot = path.join(outDir, `crop-comma-${vp.name}.png`);
        await page.screenshot({
          path: commaShot,
          clip: {
            x: Math.max(0, mBox.x + mBox.width - 40),
            y: Math.max(0, mBox.y - 10),
            width: Math.min(vp.width - (mBox.x + mBox.width - 40), 90),
            height: Math.min(vp.height - mBox.y, mBox.height + 30),
          },
        });
        console.log(`  Saved 2x crop of comma: ${commaShot}`);
      }
    }

    // Crop C: "y" and "p" descenders in "ready to drop."
    const hlReadyEl = await page.$('.hl-ready');
    if (hlReadyEl) {
      const rBox = await hlReadyEl.boundingBox();
      if (rBox) {
        const readyDescendersShot = path.join(outDir, `crop-ready-descenders-${vp.name}.png`);
        await page.screenshot({
          path: readyDescendersShot,
          clip: {
            x: Math.max(0, rBox.x - 10),
            y: Math.max(0, rBox.y - 10),
            width: Math.min(vp.width - rBox.x, rBox.width + 20),
            height: Math.min(vp.height - rBox.y, rBox.height + 40),
          },
        });
        console.log(`  Saved 2x crop of ready descenders: ${readyDescendersShot}`);
      }
    }

    // Crop D: Right tab logo
    const rightTabBtn = await page.$('.hero-right-tab button');
    if (rightTabBtn) {
      const isVisible = await rightTabBtn.isVisible();
      if (isVisible) {
        const rightTabShot = path.join(outDir, `crop-right-tab-${vp.name}.png`);
        await rightTabBtn.screenshot({ path: rightTabShot });
        console.log(`  Saved 2x crop of right tab logo: ${rightTabShot}`);
      }
    }

    // Crop E: Prompt mark ">_"
    const promptEl = await page.$('.hero-motif-right');
    if (promptEl) {
      const promptShot = path.join(outDir, `crop-prompt-motif-${vp.name}.png`);
      await promptEl.screenshot({ path: promptShot });
      console.log(`  Saved 2x crop of prompt motif: ${promptShot}`);
    }

    // Crop F: Top-left GitHub icon
    const githubEl = await page.$('a[aria-label="GitHub repository"]');
    if (githubEl) {
      const ghShot = path.join(outDir, `crop-github-icon-${vp.name}.png`);
      await githubEl.screenshot({ path: ghShot });
      console.log(`  Saved 2x crop of GitHub icon: ${ghShot}`);
    }

    // Crop G: Scroll cue at bottom center
    const cueEl = await page.$('.hero-scroll-cue button');
    if (cueEl) {
      const cueShot = path.join(outDir, `crop-scroll-cue-${vp.name}.png`);
      await cueEl.screenshot({ path: cueShot });
      console.log(`  Saved 2x crop of scroll cue: ${cueShot}`);
    }

    await page.close();
  }

  // ---------------- SCROLLED STATE VERIFICATION ----------------
  console.log('\n================ Glass Nav & Scrolled State Verification ================');
  const scrollPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await scrollPage.goto('http://localhost:5173/?nointro', { waitUntil: 'networkidle' });
  await scrollPage.waitForTimeout(500);

  // Check scroll cue visibility initially
  const initialCueOpacity = await scrollPage.evaluate(() => {
    const cue = document.querySelector('.hero-scroll-cue');
    return cue ? window.getComputedStyle(cue).opacity : null;
  });
  console.log(`  Initial scroll cue opacity: ${initialCueOpacity} (should be 1)`);

  // Scroll 100px down
  await scrollPage.evaluate(() => window.scrollTo(0, 100));
  await scrollPage.waitForTimeout(400);

  const scrolledState = await scrollPage.evaluate(() => {
    const cue = document.querySelector('.hero-scroll-cue');
    const nav = document.querySelector('[data-testid="landing-nav"]');
    const glass = document.querySelector('[data-testid="nav-glass-bar"]');
    return {
      cueOpacity: cue ? window.getComputedStyle(cue).opacity : null,
      scrolledAttr: nav?.getAttribute('data-scrolled'),
      glassOpacity: glass ? window.getComputedStyle(glass).opacity : null,
    };
  });
  console.log(`  Scrolled 100px:`);
  console.log(`    Scroll cue opacity: ${scrolledState.cueOpacity} (should be 0)`);
  console.log(`    Nav data-scrolled: ${scrolledState.scrolledAttr} (should be true)`);
  console.log(`    Glass bar opacity: ${scrolledState.glassOpacity} (should be 1)`);

  if (scrolledState.cueOpacity === '0') {
    console.log('  PASS: Scroll cue fades out after scrolling past 80px.');
  } else {
    console.error(`  FAIL: Scroll cue did not fade out (opacity is ${scrolledState.cueOpacity})`);
    allPassed = false;
  }

  await scrollPage.close();
  await browser.close();

  console.log(`\n=== LAYOUT CHECK COMPLETE. OVERALL STATUS: ${allPassed ? 'ALL PASSED' : 'HAS ISSUES'} ===`);
  if (!allPassed) {
    process.exit(1);
  }
}

runCheck().catch((err) => {
  console.error(err);
  process.exit(1);
});
