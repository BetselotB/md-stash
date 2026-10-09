import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve(process.cwd(), 'scripts/out');
const FRAMES_DIR = path.resolve(OUT_DIR, 'frames');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR, { recursive: true });

const TARGET_MOMENTS = [
  { id: 'act1-drag', label: 'Act 1: drag CLAUDE.md mid-flight', act: 1, step: 'act1-drag', delay: 600 },
  { id: 'act1-drop', label: 'Act 1: drop CLAUDE.md chip', act: 1, step: 'act1-drop', delay: 100 },
  { id: 'act1-sent', label: 'Act 1: message in chat (with reply)', act: 1, step: 'act1-sent', delay: 600 },
  { id: 'act1-reset', label: 'Act 1: Reset click', act: 1, step: 'act1-reset', delay: 150 },
  { id: 'select-agents', label: 'Act 2: select AGENTS.md', act: 1, step: 'select-agents', delay: 150 },
  { id: 'act2-copy', label: 'Act 2: Copy click (showing Copied! feedback)', act: 2, step: 'act2-copy', delay: 450 },
  { id: 'act2-paste', label: 'Act 2: Paste into chat', act: 2, step: 'act2-paste', delay: 150 },
  { id: 'act2-reset', label: 'Act 2: Reset click', act: 2, step: 'act2-reset', delay: 150 },
  { id: 'select-cursorrules', label: 'Act 3: select .cursorrules', act: 2, step: 'select-cursorrules', delay: 150 },
  { id: 'act3-drag', label: 'Act 3: drag .cursorrules mid-flight', act: 3, step: 'act3-drag', delay: 600 },
  { id: 'act3-send', label: 'Act 3: Send click', act: 3, step: 'act3-send', delay: 200 },
  { id: 'act3-reset', label: 'Act 3: Reset click', act: 3, step: 'act3-reset', delay: 150 },
  { id: 'rest', label: 'Return to HOME (CLAUDE.md selected, chat clear, cursor parked)', act: 3, step: 'rest', delay: 350 },
];

async function captureSheetForViewport(viewport, outputPngName) {
  console.log(`\n======================================================`);
  console.log(`CAPTURING CONTACT SHEET: ${viewport.width}x${viewport.height}`);
  console.log(`======================================================`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173/?demodebug&nointro', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#playground').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const frames = [];
  let targetIndex = 0;
  const startTime = Date.now();

  console.log(`Targeting 13 key moments across loop...`);

  // Wait if we started mid-loop: wait until step is act1-move-to-chip or idle to begin from frame 0
  while (Date.now() - startTime < 45000 && targetIndex === 0) {
    const curStep = await page.evaluate(() => window.__demo?.step);
    if (curStep === 'act1-move-to-chip' || curStep === 'act1-grab') {
      break;
    }
    await page.waitForTimeout(100);
  }

  while (targetIndex < TARGET_MOMENTS.length && Date.now() - startTime < 60000) {
    const target = TARGET_MOMENTS[targetIndex];
    const state = await page.evaluate(() => ({
      step: window.__demo?.step,
      act: window.__demo?.act,
      phase: document.querySelector('#playground')?.getAttribute('data-demo-phase'),
    }));

    if (state.step === target.step || state.phase === target.step) {
      if (target.delay) {
        await page.waitForTimeout(target.delay);
      }

      const frameFileName = `frame-${viewport.width}-${targetIndex.toString().padStart(2, '0')}-${target.id}.png`;
      const frameFilePath = path.join(FRAMES_DIR, frameFileName);
      const playgroundEl = page.locator('#playground');
      await playgroundEl.screenshot({ path: frameFilePath });

      frames.push({
        idx: targetIndex + 1,
        label: target.label,
        step: target.step,
        file: frameFileName,
      });

      console.log(`  [Frame ${targetIndex + 1}/13] ${target.label} -> ${frameFileName}`);
      targetIndex++;

      // Small cooldown to avoid duplicate triggers if same step
      await page.waitForTimeout(200);
    } else {
      await page.waitForTimeout(50);
    }
  }

  await browser.close();

  if (frames.length < TARGET_MOMENTS.length) {
    console.warn(`Captured ${frames.length}/${TARGET_MOMENTS.length} frames.`);
  } else {
    console.log(`Captured all 13 frames for ${viewport.width}px! Tiling contact sheet...`);
  }

  // Build HTML contact sheet page
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Contact Sheet ${viewport.width}px</title>
  <style>
    body {
      margin: 0;
      padding: 30px;
      background: #18201c;
      color: #fdfbf7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    h1 {
      margin: 0 0 24px 0;
      font-size: 26px;
      font-weight: 700;
      color: #eeb257;
      letter-spacing: -0.02em;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(${viewport.width > 1000 ? 3 : 2}, 1fr);
      gap: 20px;
    }
    .card {
      background: #232e29;
      border: 1px solid rgba(253, 251, 247, 0.15);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .meta {
      padding: 10px 14px;
      background: rgba(0, 0, 0, 0.4);
      font-size: 13px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      color: #eeb257;
      border-bottom: 1px solid rgba(253, 251, 247, 0.08);
    }
    .meta span.label {
      color: #fdfbf7;
      margin-left: 8px;
      font-weight: 500;
    }
    img {
      width: 100%;
      height: auto;
      display: block;
    }
  </style>
</head>
<body>
  <h1>Playground Demo Contact Sheet (${viewport.width}x${viewport.height} Viewport &bull; 13 Key Moments)</h1>
  <div class="grid">
    ${frames
      .map(
        (f) => `
      <div class="card">
        <div class="meta">
          <span>Moment #${f.idx}</span>
          <span class="label">${f.label}</span>
        </div>
        <img src="frames/${f.file}" alt="${f.label}" />
      </div>`
      )
      .join('')}
  </div>
</body>
</html>`;

  const htmlPath = path.join(OUT_DIR, `demo-sheet-${viewport.width}.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  // Open the HTML file in Playwright and capture the full page PNG
  const sheetBrowser = await chromium.launch({ headless: true });
  const sheetContext = await sheetBrowser.newContext({
    viewport: { width: viewport.width > 1000 ? 2560 : 1200, height: 1600 },
    deviceScaleFactor: 1,
  });
  const sheetPage = await sheetContext.newPage();
  await sheetPage.goto(`file://${htmlPath}`, { waitUntil: 'load' });
  await sheetPage.waitForTimeout(1000);

  const outSheetPng = path.join(OUT_DIR, outputPngName);
  await sheetPage.screenshot({ path: outSheetPng, fullPage: true });
  console.log(`  SUCCESS: Saved contact sheet to: ${outSheetPng}`);

  await sheetBrowser.close();
}

async function main() {
  await captureSheetForViewport({ width: 2560, height: 1440 }, 'demo-sheet-2560.png');
  await captureSheetForViewport({ width: 390, height: 844 }, 'demo-sheet-390.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
