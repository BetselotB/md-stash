import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('scripts/out/restyle-qa');
fs.mkdirSync(OUT_DIR, { recursive: true });

function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
  const l1 = getRelativeLuminance(...rgb1);
  const l2 = getRelativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

async function run() {
  console.log('--- Starting Playwright Verification (Combined Pass) ---');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('http://localhost:5173/app');
  await page.waitForLoadState('networkidle');

  // Seed 5 files in 3 collections with muted craft colors
  console.log('Seeding 5 files across 3 collections in IndexedDB...');
  await page.evaluate(async () => {
    const req = indexedDB.open('MDstashDB');
    await new Promise((resolve, reject) => {
      req.onsuccess = async (e) => {
        const db = e.target.result;
        try {
          const colTx = db.transaction(['collections', 'files'], 'readwrite');
          const colStore = colTx.objectStore('collections');
          const fileStore = colTx.objectStore('files');

          await new Promise((res) => {
            const clearFiles = fileStore.clear();
            clearFiles.onsuccess = res;
          });
          await new Promise((res) => {
            const clearCols = colStore.clear();
            clearCols.onsuccess = res;
          });

          // Muted craft colors: orange (#E28B38), mustard (#D4A234), slate blue (#6B8B9B)
          const c1 = { id: 'col-ai', name: 'AI Context', color: '#E28B38', icon: 'folder', order: 0, createdAt: Date.now() };
          const c2 = { id: 'col-rules', name: 'Rules & Configs', color: '#D4A234', icon: 'folder', order: 1, createdAt: Date.now() };
          const c3 = { id: 'col-starters', name: 'Starters & Templates', color: '#6B8B9B', icon: 'folder', order: 2, createdAt: Date.now() };

          colStore.put(c1);
          colStore.put(c2);
          colStore.put(c3);

          fileStore.put({
            id: 'f-1',
            title: 'Claude Project Memory & Rules',
            filename: 'CLAUDE.md',
            content: '# Claude Project Memory\n\nPersistent contextual guidelines for AI agents.\n- Zero cloud dependencies\n- Strict TypeScript typing',
            collectionId: 'col-ai',
            tags: ['claude', 'rules', 'prompt'],
            pinned: true,
            size: 420,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          fileStore.put({
            id: 'f-2',
            title: 'Cursor Rules Cheatsheet',
            filename: '.cursorrules',
            content: '# Cursor Rules\n\nFull-stack rules for web applications.\n- Use Tailwind tokens\n- Keep modular architecture',
            collectionId: 'col-rules',
            tags: ['cursor', 'ai', 'config'],
            pinned: true,
            size: 310,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          fileStore.put({
            id: 'f-3',
            title: 'Standard Project README Starter',
            filename: 'README-starter.md',
            content: '# Project Name\n\nA concise starter readme.\n\n## Features\n- Local-first design\n- Fast performance',
            collectionId: 'col-starters',
            tags: ['template', 'readme'],
            pinned: false,
            size: 360,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          fileStore.put({
            id: 'f-4',
            title: 'Vitest Unit Testing Guidelines',
            filename: 'TESTING.md',
            content: '# Testing Standards\n\nRun fast headless tests with zero flakiness.\n- Unit tests run under 10ms\n- End to end verification with Playwright',
            collectionId: 'col-rules',
            tags: ['testing', 'vitest'],
            pinned: false,
            size: 280,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          fileStore.put({
            id: 'f-5',
            title: 'Design Tokens Architecture',
            filename: 'TOKENS.md',
            content: '# Tokens System\n\nColor tokens and paper textures.\n- Warm oat cards\n- Sage canvas and deep sage sidebar',
            collectionId: 'col-ai',
            tags: ['design', 'tokens'],
            pinned: false,
            size: 510,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          colTx.oncomplete = resolve;
          colTx.onerror = reject;
        } catch (err) {
          reject(err);
        }
      };
      req.onerror = reject;
    });
  });

  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);

  // 1. Assertions on old tabs and old decorative pins
  console.log('\n--- DOM Structure Assertions ---');
  const oldTabsCount = await page.$$eval('.absolute.-top-\\[14px\\]', (els) => els.length);
  console.log(`Old coloured folder tab elements found: ${oldTabsCount} (Expected: 0)`);
  if (oldTabsCount !== 0) throw new Error(`Found ${oldTabsCount} old coloured tab elements!`);

  const oldDecorativePins = await page.$$eval('.group\\/pin svg ellipse, .group\\/pin circle[r="7"]', (els) => els.length);
  console.log(`Old decorative round pushpin elements found: ${oldDecorativePins} (Expected: 0)`);
  if (oldDecorativePins !== 0) throw new Error(`Found ${oldDecorativePins} old decorative pushpin elements!`);

  // 2. No emoji in DOM text
  const emojiMatches = await page.evaluate(() => {
    const text = document.body.innerText;
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const matches = text.match(emojiRegex);
    return matches || [];
  });
  console.log(`Emojis found in DOM text: ${emojiMatches.length} (${emojiMatches.join(', ') || 'None'})`);
  if (emojiMatches.length !== 0) throw new Error('Found emojis in DOM text!');

  // 3. Contrast verification across Cards, Top bar, Sidebar
  console.log('\n--- Contrast Verification (Text >= 4.5:1, Icons >= 3:1) ---');
  const contrastData = await page.evaluate(() => {
    const getBg = (el) => window.getComputedStyle(el).backgroundColor;
    const getColor = (el) => window.getComputedStyle(el).color;

    // Card elements
    const card = document.querySelector('.group.relative.flex.flex-col');
    const cardBg = card ? getBg(card) : '';
    const title = card?.querySelector('h2');
    const filename = card?.querySelector('.font-mono.bg-\\[\\#CBC5AC\\]');
    const filenameBg = filename ? getBg(filename) : '';
    const preview = card?.querySelector('p');
    const size = card?.querySelector('.font-mono.text-ink\\/65');
    const tag = card?.querySelector('.text-\\[10\\.5px\\]');

    // Search bar elements
    const searchContainer = document.querySelector('header input')?.parentElement;
    const searchBg = searchContainer ? getBg(searchContainer) : '';
    const searchIcon = searchContainer?.querySelector('svg');
    const searchInput = searchContainer?.querySelector('input');
    const searchKbd = searchContainer?.querySelector('kbd');
    const searchKbdBg = searchKbd ? getBg(searchKbd) : '';

    // View toggle
    const toggleContainer = document.querySelector('button[title="Grid view"]')?.parentElement;
    const toggleBg = toggleContainer ? getBg(toggleContainer) : '';
    const gridBtn = document.querySelector('button[title="Grid view"]');
    const gridIcon = gridBtn?.querySelector('svg');
    const listBtn = document.querySelector('button[title="List view"]');
    const listIcon = listBtn?.querySelector('svg');

    // Import & settings
    const importBtn = Array.from(document.querySelectorAll('header button')).find((b) => b.textContent?.includes('Import'));
    const importBg = importBtn ? getBg(importBtn) : '';
    const settingsBtn = document.querySelector('header a[title="Settings"]');
    const settingsBg = settingsBtn ? getBg(settingsBtn) : '';

    // Sidebar
    const sidebar = document.querySelector('aside');
    const sidebarBg = sidebar ? getBg(sidebar) : '';
    const activeTab = sidebar?.querySelector('a.bg-cream');
    const activeTabBg = activeTab ? getBg(activeTab) : '';
    const inactiveTab = sidebar?.querySelector('a.text-cream');

    return {
      card: {
        bg: cardBg,
        titleColor: title ? getColor(title) : '',
        filenameBg,
        filenameColor: filename ? getColor(filename) : '',
        previewColor: preview ? getColor(preview) : '',
        sizeColor: size ? getColor(size) : '',
        tagColor: tag ? getColor(tag) : '',
      },
      search: {
        bg: searchBg,
        iconColor: searchIcon ? getColor(searchIcon) : '',
        inputColor: searchInput ? getColor(searchInput) : '',
        kbdBg: searchKbdBg,
        kbdColor: searchKbd ? getColor(searchKbd) : '',
      },
      toggle: {
        bg: toggleBg,
        activeBg: gridBtn ? getBg(gridBtn) : '',
        activeIconColor: gridIcon ? getColor(gridIcon) : '',
        inactiveIconColor: listIcon ? getColor(listIcon) : '',
      },
      actions: {
        importBg,
        importTextColor: importBtn ? getColor(importBtn) : '',
        settingsBg,
        settingsIconColor: settingsBtn?.querySelector('svg') ? getColor(settingsBtn.querySelector('svg')) : '',
      },
      sidebar: {
        bg: sidebarBg,
        activeTabBg,
        activeTabTextColor: activeTab ? getColor(activeTab.querySelector('span')) : '',
        inactiveTextColor: inactiveTab ? getColor(inactiveTab.querySelector('span')) : '',
      },
    };
  });

  const failures = [];

  function checkContrast(label, bgStr, textStr, minRatio, type) {
    const bgRgb = parseRgb(bgStr);
    const textRgb = parseRgb(textStr);
    const ratio = getContrastRatio(bgRgb, textRgb);
    const pass = ratio >= minRatio;
    console.log(`[${type}] ${label}: ${ratio.toFixed(2)}:1 (Min: ${minRatio}:1 -> ${pass ? 'PASS' : 'FAIL'})`);
    if (!pass) failures.push({ label, ratio: ratio.toFixed(2), minRatio });
  }

  // Card contrasts
  checkContrast('Card Title (Full Ink)', contrastData.card.bg, contrastData.card.titleColor, 4.5, 'TEXT');
  checkContrast('Card Filename on Label Strip', contrastData.card.filenameBg, contrastData.card.filenameColor, 4.5, 'TEXT');
  checkContrast('Card Preview (80% ink)', contrastData.card.bg, contrastData.card.previewColor, 4.5, 'TEXT');
  checkContrast('Card Size in Mono', contrastData.card.bg, contrastData.card.sizeColor, 4.5, 'TEXT');
  checkContrast('Card Tag Chip Text', contrastData.card.bg, contrastData.card.tagColor, 4.5, 'TEXT');

  // Search bar contrasts
  checkContrast('Search Magnifier Icon', contrastData.search.bg, contrastData.search.iconColor, 3.0, 'ICON');
  checkContrast('Search Input Text', contrastData.search.bg, contrastData.search.inputColor, 4.5, 'TEXT');
  checkContrast('Search "/" Kbd Chip Text', contrastData.search.kbdBg, contrastData.search.kbdColor, 4.5, 'TEXT');

  // View toggle contrasts
  checkContrast('View Toggle Active Icon', contrastData.toggle.activeBg, contrastData.toggle.activeIconColor, 3.0, 'ICON');
  checkContrast('View Toggle Inactive Icon', contrastData.toggle.bg, contrastData.toggle.inactiveIconColor, 3.0, 'ICON');

  // Import & Settings contrasts
  checkContrast('Import Button Text', contrastData.actions.importBg, contrastData.actions.importTextColor, 4.5, 'TEXT');
  checkContrast('Settings Icon', contrastData.actions.settingsBg, contrastData.actions.settingsIconColor, 3.0, 'ICON');

  // Sidebar contrasts
  checkContrast('Sidebar Inactive Nav Text', contrastData.sidebar.bg, contrastData.sidebar.inactiveTextColor, 4.5, 'TEXT');
  checkContrast('Sidebar Active Tab Text', contrastData.sidebar.activeTabBg, contrastData.sidebar.activeTabTextColor, 4.5, 'TEXT');

  if (failures.length > 0) {
    console.error('Contrast failures encountered:', failures);
    throw new Error(`Encountered ${failures.length} contrast failures!`);
  }

  // 4. Pin and Checkbox Overlap Check
  console.log('\n--- Pin and Checkbox Overlap Check ---');
  const overlapCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.group.relative.flex.flex-col'));
    return cards.map((card, idx) => {
      const checkbox = card.querySelector('button[aria-label="Select file"]');
      const pinBtn = card.querySelector('button[title="Pin"], button[title="Unpin"]');
      const dragHandle = card.querySelector('.cursor-grab');

      const cBox = checkbox?.getBoundingClientRect();
      const pBox = pinBtn?.getBoundingClientRect();
      const dBox = dragHandle?.getBoundingClientRect();

      let pinIntersectsCheckbox = false;
      let pinIntersectsDrag = false;

      if (cBox && pBox) {
        pinIntersectsCheckbox = !(
          pBox.right < cBox.left ||
          pBox.left > cBox.right ||
          pBox.bottom < cBox.top ||
          pBox.top > cBox.bottom
        );
      }

      if (dBox && pBox) {
        pinIntersectsDrag = !(
          pBox.right < dBox.left ||
          pBox.left > dBox.right ||
          pBox.bottom < dBox.top ||
          pBox.top > dBox.bottom
        );
      }

      return {
        cardIndex: idx,
        pinIntersectsCheckbox,
        pinIntersectsDrag,
        pinToCheckboxDistance: cBox && pBox ? Math.round(pBox.left - cBox.right) : null,
      };
    });
  });

  console.log('Overlap check results:', JSON.stringify(overlapCheck, null, 2));
  const hasOverlap = overlapCheck.some((o) => o.pinIntersectsCheckbox || o.pinIntersectsDrag);
  if (hasOverlap) throw new Error('Overlap detected between pin and other card controls!');
  console.log('Overlap check: PASS (No controls overlap)');

  // 5. Pin / Unpin updates count
  console.log('\n--- Pin / Unpin Count Updates ---');
  const initialPinnedBadge = await page.$eval('a[href*="filter=pinned"] span.font-mono', (el) => el.textContent?.trim());
  console.log(`Initial Pinned count: ${initialPinnedBadge}`);

  // Click pin on an unpinned card
  const unpinnedBtn = await page.$('div:has(> div:has-text("Files")) + div button[title="Pin"]');
  if (unpinnedBtn) {
    await unpinnedBtn.click();
    await page.waitForTimeout(400);
    const updatedPinnedBadge = await page.$eval('a[href*="filter=pinned"] span.font-mono', (el) => el.textContent?.trim());
    console.log(`Updated Pinned count after pin: ${updatedPinnedBadge}`);
  }

  // 6. Test Card Drop into Collection
  console.log('\n--- Drag Card into Collection Test ---');
  const cardToDrag = await page.$('.group.relative.flex.flex-col');
  const targetCol = await page.$('aside .truncate.tracking-tight.font-sans');
  if (cardToDrag && targetCol) {
    const cBox = await cardToDrag.boundingBox();
    const colBox = await targetCol.boundingBox();
    if (cBox && colBox) {
      await page.mouse.move(cBox.x + cBox.width / 2, cBox.y + cBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(colBox.x + colBox.width / 2, colBox.y + colBox.height / 2, { steps: 8 });
      await page.waitForTimeout(200);
      await page.mouse.up();
      await page.waitForTimeout(400);
      console.log('Card drag & drop triggered successfully');
    }
  }

  // 7. Capture 2x High-Resolution Screenshots
  console.log('\n--- Capturing 2x High-Resolution Screenshots ---');
  // 1440 Viewport
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(OUT_DIR, 'library-1440.png') });
  console.log('Saved library-1440.png');

  // Selected card screenshot (with bundle tray)
  const firstCheckbox = await page.$('.group.relative.flex.flex-col button[aria-label="Select file"]');
  if (firstCheckbox) {
    await firstCheckbox.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT_DIR, 'selected-card-1440.png') });
    console.log('Saved selected-card-1440.png');
  }

  // 2560 Viewport
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.screenshot({ path: path.join(OUT_DIR, 'library-2560.png') });
  console.log('Saved library-2560.png');

  console.log(`\nConsole errors encountered: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
    throw new Error('Encountered console errors!');
  }

  await browser.close();
  console.log('\n--- Playwright Verification Finished Successfully ---');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
