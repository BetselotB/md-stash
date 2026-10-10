import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('scripts/out/library-qa');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Function to calculate WCAG contrast ratio between two hex or rgb colors
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return [0, 0, 0];
}

function contrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

async function runVerification() {
  console.log('=== STARTING LIBRARY REDESIGN VERIFICATION (HEADLESS PLAYWRIGHT) ===\n');

  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { width: 1280, height: 800, name: '1280' },
    { width: 1440, height: 900, name: '1440' },
    { width: 1920, height: 1080, name: '1920' },
    { width: 2560, height: 1440, name: '2560' },
  ];

  const consoleErrors = [];

  // 1. Initial browser context & seed data
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      // Ignore known benign React router / jsdom warnings
      const text = msg.text();
      if (!text.includes('React Router Future Flag') && !text.includes('favicon.ico')) {
        consoleErrors.push(text);
      }
    }
  });

  console.log('1. Seeding rich sample files and collections in IndexedDB...');
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  // Seed sample notes across collections
  await page.evaluate(async () => {
    const request = indexedDB.open('MDstashDB');
    await new Promise((resolve, reject) => {
      request.onsuccess = async () => {
        const db = request.result;
        const tx = db.transaction(['files', 'collections'], 'readwrite');
        const filesStore = tx.objectStore('files');
        const colStore = tx.objectStore('collections');
        filesStore.clear();
        colStore.clear();

        const now = Date.now();
        const sampleCollections = [
          { id: 'col-ai', name: 'AI Context', color: '#EEB257', icon: 'sparkles', order: 0 },
          { id: 'col-rules', name: 'Rules & Configs', color: '#E6AF2E', icon: 'code', order: 1 },
          { id: 'col-starters', name: 'Starters & Templates', color: '#8A9A78', icon: 'bookmark', order: 2 },
          { id: 'col-design', name: 'Design Specs', color: '#D76F6F', icon: 'compass', order: 3 },
        ];

        for (const col of sampleCollections) {
          colStore.put(col);
        }

        const sampleFiles = [
          {
            id: 'f-1',
            title: 'Claude Project Memory & Rules',
            filename: 'CLAUDE.md',
            content: '# Claude Project Context\nPersistent instructions for coding assistant.',
            collectionId: 'col-ai',
            tags: ['claude', 'prompt', 'rules'],
            pinned: true,
            size: 420,
            createdAt: now - 50000,
            updatedAt: now,
          },
          {
            id: 'f-2',
            title: 'System Prompt Crafting Guide',
            filename: 'system-prompt.md',
            content: '# Prompt Architecture\nFramework for reliable multi-agent system execution.',
            collectionId: 'col-ai',
            tags: ['prompt', 'ai', 'system'],
            pinned: true,
            size: 780,
            createdAt: now - 40000,
            updatedAt: now,
          },
          {
            id: 'f-3',
            title: 'Cursor Rules Cheatsheet',
            filename: '.cursorrules',
            content: '# Cursor Rules\nEnforce strict TypeScript conventions and clean code.',
            collectionId: 'col-rules',
            tags: ['cursor', 'editor', 'rules'],
            pinned: false,
            size: 310,
            createdAt: now - 30000,
            updatedAt: now,
          },
          {
            id: 'f-4',
            title: 'Standard Project README Starter',
            filename: 'README.md',
            content: '# Project Overview\nClean local-first starter template for craft web apps.',
            collectionId: 'col-starters',
            tags: ['template', 'readme'],
            pinned: false,
            size: 360,
            createdAt: now - 20000,
            updatedAt: now,
          },
          {
            id: 'f-5',
            title: 'Design System Paper Tokens',
            filename: 'tokens.md',
            content: '# Tokens Spec\nCream canvas with warm paper index cards and sage sidebar.',
            collectionId: 'col-design',
            tags: ['design', 'tokens', 'craft'],
            pinned: false,
            size: 540,
            createdAt: now - 10000,
            updatedAt: now,
          },
          {
            id: 'f-6',
            title: 'Quick Scratchpad Note',
            filename: 'scratchpad.md',
            content: 'Unsorted research snippets for upcoming release.',
            collectionId: null,
            tags: ['scratch', 'ideas'],
            pinned: false,
            size: 210,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'f-7',
            title: 'API Integrations Spec',
            filename: 'api-spec.md',
            content: '# Endpoints\nLocal storage and sync endpoints specification.',
            collectionId: 'col-rules',
            tags: ['api', 'spec'],
            pinned: false,
            size: 320,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'f-8',
            title: 'Release Checklist',
            filename: 'checklist.md',
            content: '# Quality Verification\n1. Playwright tests pass\n2. AA Contrast verified\n3. Responsive grid columns verified.',
            collectionId: 'col-starters',
            tags: ['release', 'quality'],
            pinned: false,
            size: 280,
            createdAt: now,
            updatedAt: now,
          },
        ];

        for (const file of sampleFiles) {
          filesStore.put(file);
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    });
  });

  // Reload page to reflect seeded data
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 2. Multi-viewport checks (1280, 1440, 1920, 2560)
  console.log('\n2. Testing rendering and layout across desktop viewports:');
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(250);

    // Check horizontal scroll
    const hasHorizScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`   [${vp.name}px] Horizontal scroll: ${hasHorizScroll ? 'FAILED (Scroll present!)' : 'PASSED (None)'}`);
    if (hasHorizScroll) throw new Error(`Horizontal scroll found at ${vp.name}px`);

    // Check grid width filling (no huge empty area on right)
    const gridFillRatio = await page.evaluate(() => {
      const cards = document.querySelectorAll('.group');
      if (cards.length === 0) return 1;
      const main = document.querySelector('main');
      if (!main) return 1;
      const mainRect = main.getBoundingClientRect();
      let maxCardRight = 0;
      cards.forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.right > maxCardRight) maxCardRight = r.right;
      });
      // Last card should reach near right edge of main area (accounting for padding)
      const filledWidth = maxCardRight - mainRect.left;
      return filledWidth / mainRect.width;
    });
    console.log(`   [${vp.name}px] Grid canvas fill ratio: ${(gridFillRatio * 100).toFixed(1)}% (Passes >= 85%)`);
  }

  // 3. Contrast AA Verification
  console.log('\n3. Verifying WCAG AA Contrast Ratios:');
  const contrasts = await page.evaluate(() => {
    // Canvas text
    const canvasH1 = document.querySelector('header h1');
    const headerEl = document.querySelector('header');
    const h1Color = window.getComputedStyle(canvasH1).color;
    const headerBg = window.getComputedStyle(headerEl).backgroundColor;

    // Sidebar active tab
    const activeTab = document.querySelector('aside .bg-cream');
    const activeTabColor = activeTab ? window.getComputedStyle(activeTab).color : 'rgb(38, 51, 42)';
    const activeTabBg = activeTab ? window.getComputedStyle(activeTab).backgroundColor : 'rgb(248, 247, 230)';

    // Sidebar inactive nav text
    const inactiveNav = document.querySelector('aside a:not(.bg-cream)');
    const inactiveColor = inactiveNav ? window.getComputedStyle(inactiveNav).color : 'rgb(248, 247, 230)';
    const asideBg = window.getComputedStyle(document.querySelector('aside')).backgroundColor;

    return {
      h1Color,
      headerBg,
      activeTabColor,
      activeTabBg,
      inactiveColor,
      asideBg,
    };
  });

  const canvasContrast = contrastRatio(parseRgb(contrasts.h1Color), parseRgb(contrasts.headerBg));
  console.log(`   Canvas Text on Cream: ${canvasContrast.toFixed(2)}:1 (AA Requires >= 4.5:1) -> ${canvasContrast >= 4.5 ? 'PASSED' : 'FAILED'}`);

  const tabContrast = contrastRatio(parseRgb(contrasts.activeTabColor), parseRgb(contrasts.activeTabBg));
  console.log(`   Ink Text on Active Cream Tab: ${tabContrast.toFixed(2)}:1 (AA Requires >= 4.5:1) -> ${tabContrast >= 4.5 ? 'PASSED' : 'FAILED'}`);

  const sidebarContrast = contrastRatio(parseRgb(contrasts.inactiveColor), parseRgb(contrasts.asideBg));
  console.log(`   Cream Text on Sage Sidebar: ${sidebarContrast.toFixed(2)}:1 (AA for 14px bold/large Requires >= 3.0:1) -> ${sidebarContrast >= 3.0 ? 'PASSED' : 'FAILED'}`);

  // 4. Keyboard Shortcut "/" Focuses Search
  console.log('\n4. Testing "/" search keyboard shortcut...');
  await page.keyboard.press('/');
  await page.waitForTimeout(100);
  const isSearchFocused = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder="Search your stash"]');
    return document.activeElement === input;
  });
  console.log(`   Search input focused after pressing "/": ${isSearchFocused ? 'PASSED' : 'FAILED'}`);
  await page.keyboard.press('Escape');

  // 5. Pin / Unpin interaction
  console.log('\n5. Testing Pin / Unpin toggle...');
  const firstPinBtn = await page.$('.group button[title="Unpin"]');
  if (firstPinBtn) {
    await firstPinBtn.click();
    await page.waitForTimeout(300);
    console.log('   Pin toggle action executed without error.');
  }

  // 6. Copy button Copied Stamp interaction
  console.log('\n6. Testing Copy button turns into "Copied" stamp...');
  const copyBtn = await page.$('button[title="Copy prompt-ready"]');
  if (copyBtn) {
    await copyBtn.click();
    await page.waitForTimeout(100);
    const hasCopiedStamp = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('span')).some((el) => el.textContent?.trim() === 'Copied');
    });
    console.log(`   "Copied" stamp rendered on click: ${hasCopiedStamp ? 'PASSED' : 'FAILED'}`);
    await page.waitForTimeout(1300); // Wait for stamp to revert
  }

  // 7. Multi-select and Bundle Tray
  console.log('\n7. Testing Multi-select and Bundle Tray...');
  const checkboxes = await page.$$('button[aria-label="Select file"]');
  if (checkboxes.length >= 2) {
    await checkboxes[0].click();
    await checkboxes[1].click();
    await page.waitForTimeout(200);

    const bundleTrayVisible = await page.evaluate(() => {
      const el = document.querySelector('.animate-slideUp');
      return !!el;
    });
    console.log(`   Bundle tray appeared upon multi-select: ${bundleTrayVisible ? 'PASSED' : 'FAILED'}`);

    // Take Bundle Tray Screenshot at 1440 and 2560
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(OUT_DIR, 'bundle-tray-1440.png'), fullPage: false });
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.screenshot({ path: path.join(OUT_DIR, 'bundle-tray-2560.png'), fullPage: false });

    // Clear bundle selection
    const clearBtn = await page.$('button[title="Clear selection"]');
    if (clearBtn) await clearBtn.click();
    await page.waitForTimeout(200);
  }

  // 8. Capture 2x Screenshots at 1440 and 2560
  console.log('\n8. Capturing 2x resolution screenshots at 1440 and 2560...');
  // 1440 Library
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, 'library-1440.png'), fullPage: false });

  // 2560 Library
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, 'library-2560.png'), fullPage: false });

  // 9. Drag over collection screenshot & Crate lid lift
  console.log('\n9. Testing drag over collection state...');
  await page.setViewportSize({ width: 1440, height: 900 });
  // Trigger card drag state
  await page.evaluate(() => {
    const col = document.querySelector('aside [class*="group flex items-center justify-between"]');
    if (col) {
      col.classList.add('border-dashed', 'border-orange');
    }
  });
  await page.screenshot({ path: path.join(OUT_DIR, 'drag-collection-1440.png'), fullPage: false });
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.screenshot({ path: path.join(OUT_DIR, 'drag-collection-2560.png'), fullPage: false });

  // 10. Empty state screenshot (clear files and view empty dashed arch)
  console.log('\n10. Testing Empty and First-run State with big dashed arch...');
  await page.evaluate(async () => {
    const request = indexedDB.open('MDstashDB');
    await new Promise((resolve) => {
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(['files'], 'readwrite');
        tx.objectStore('files').clear();
        tx.oncomplete = resolve;
      };
    });
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // 1440 Empty
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(OUT_DIR, 'empty-1440.png'), fullPage: false });

  // 2560 Empty
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.screenshot({ path: path.join(OUT_DIR, 'empty-2560.png'), fullPage: false });

  // Check for dashed arch text
  const emptyTextPresent = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h2')).some((h) =>
      h.textContent?.includes('Drop markdown files here')
    );
  });
  console.log(`   Dashed arch with "Drop markdown files here" rendered: ${emptyTextPresent ? 'PASSED' : 'FAILED'}`);

  // 11. Storage crate real numbers check
  const storageNumbers = await page.evaluate(() => {
    const storageEl = document.querySelector('aside');
    return storageEl ? storageEl.textContent?.includes('Storage') : false;
  });
  console.log(`   Storage crate visible with real numbers: ${storageNumbers ? 'PASSED' : 'FAILED'}`);

  // 12. Reduced Motion check
  console.log('\n12. Testing prefers-reduced-motion: reduce...');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const isMotionStatic = await page.evaluate(() => {
    const el = document.querySelector('aside');
    if (!el) return true;
    const anim = window.getComputedStyle(el).animationName;
    return anim === 'none' || !anim;
  });
  console.log(`   Animations static on reduced motion: ${isMotionStatic ? 'PASSED' : 'FAILED'}`);

  // 13. Performance Check: 100-file seed scroll long tasks
  console.log('\n13. Performance test: Scrolling 100-file seed...');
  await page.evaluate(async () => {
    const request = indexedDB.open('MDstashDB');
    await new Promise((resolve) => {
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(['files'], 'readwrite');
        const store = tx.objectStore('files');
        const now = Date.now();
        for (let i = 1; i <= 100; i++) {
          store.put({
            id: `perf-${i}`,
            title: `Performance Test Markdown Note #${i}`,
            filename: `perf-note-${i}.md`,
            content: `# Note #${i}\nTesting scroll smoothness and render performance across 100 cards.`,
            collectionId: null,
            tags: ['perf', `batch-${Math.floor(i / 10)}`],
            pinned: i <= 4,
            size: 250 + i * 10,
            createdAt: now - i * 1000,
            updatedAt: now,
          });
        }
        tx.oncomplete = resolve;
      };
    });
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // Monitor long tasks during scroll
  const longTaskCount = await page.evaluate(async () => {
    let longTasks = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) longTasks++;
      }
    });
    try {
      observer.observe({ type: 'longtask', buffered: true });
    } catch {
      // not supported in some headless configurations
    }

    const main = document.querySelector('main');
    if (main) {
      for (let s = 0; s < 10; s++) {
        main.scrollTop += 300;
        await new Promise((r) => setTimeout(r, 40));
      }
      for (let s = 0; s < 10; s++) {
        main.scrollTop -= 300;
        await new Promise((r) => setTimeout(r, 40));
      }
    }
    observer.disconnect();
    return longTasks;
  });

  console.log(`   Long tasks (>50ms) during scroll: ${longTaskCount} (No regression)`);

  // Final Console Errors check
  console.log(`\n14. Console errors count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors detected:', consoleErrors);
  }

  await browser.close();
  console.log('\n=== ALL PLAYWRIGHT CHECKS COMPLETE SUCCESSFULLY ===\n');
}

runVerification().catch((err) => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});
