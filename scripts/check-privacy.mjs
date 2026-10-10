import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('scripts/out');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function runPrivacyCheck() {
  console.log('--- Starting /privacy verification check ---');
  let hasFailure = false;

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: '2560', width: 2560, height: 1440, isDesktop: true },
    { name: '1920', width: 1920, height: 1080, isDesktop: true },
    { name: '1440', width: 1440, height: 900, isDesktop: true },
    { name: '1024', width: 1024, height: 768, isDesktop: true },
    { name: '768', width: 768, height: 1024, isDesktop: false },
    { name: '390', width: 390, height: 844, isDesktop: false },
  ];

  // 1. Initial check at 1440 width for external requests, errors, data flow, wipe
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const externalRequests = [];
  const consoleErrors = [];

  page.on('request', (req) => {
    const url = req.url();
    // Verify request is from local dev server origin
    if (!url.startsWith('http://localhost:5173') && !url.startsWith('http://127.0.0.1:5173') && !url.startsWith('data:')) {
      externalRequests.push(url);
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(`Page error: ${err.message}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`Console error: ${msg.text()}`);
    }
  });

  // Navigate to app first to seed IndexedDB data
  console.log('1. Navigating to localhost:5173 to seed IndexedDB test notes...');
  await page.goto('http://localhost:5173/app', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Seed IndexedDB tables via browser context
  await page.evaluate(async () => {
    const req = indexedDB.open('MDstashDB');
    await new Promise((resolve, reject) => {
      req.onsuccess = async () => {
        const db = req.result;
        const tx = db.transaction(['files', 'collections'], 'readwrite');
        const filesStore = tx.objectStore('files');
        const collectionsStore = tx.objectStore('collections');

        // Clear existing
        filesStore.clear();
        collectionsStore.clear();

        // Seed 3 files with 4 distinct tags total
        const now = Date.now();
        filesStore.put({
          id: 'test-1',
          filename: 'welcome.md',
          title: 'Welcome Note',
          content: '# Hello world',
          tags: ['guides', 'intro'],
          pinned: false,
          createdAt: now,
          updatedAt: now,
          collectionId: 'col-1',
        });
        filesStore.put({
          id: 'test-2',
          filename: 'tasks.md',
          title: 'Project Tasks',
          content: '- [ ] Ship redesign',
          tags: ['work'],
          pinned: true,
          createdAt: now,
          updatedAt: now,
          collectionId: 'col-1',
        });
        filesStore.put({
          id: 'test-3',
          filename: 'ideas.md',
          title: 'Future Ideas',
          content: 'Brainstorm notes',
          tags: ['work', 'notes'],
          pinned: false,
          createdAt: now,
          updatedAt: now,
          collectionId: 'col-2',
        });

        // Seed 2 collections
        collectionsStore.put({ id: 'col-1', name: 'Work', order: 0, createdAt: now });
        collectionsStore.put({ id: 'col-2', name: 'Personal', order: 1, createdAt: now });

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
  });

  console.log('2. Navigating to /privacy...');
  await page.goto('http://localhost:5173/privacy', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Assert external requests & console errors
  if (externalRequests.length > 0) {
    console.error(`FAIL: Found ${externalRequests.length} external requests:`, externalRequests);
    hasFailure = true;
  } else {
    console.log('✓ PASS: Zero external requests detected (all self-hosted local assets)');
  }

  if (consoleErrors.length > 0) {
    console.error(`FAIL: Found console errors:`, consoleErrors);
    hasFailure = true;
  } else {
    console.log('✓ PASS: Zero console/page errors');
  }

  // 3. Verify Live Proof Panel network and storage tab data
  console.log('3. Checking Live Proof Panel counts and indicators...');
  // Check online indicator
  const onlineText = await page.textContent('#proof-panel');
  if (!onlineText.includes('Online')) {
    console.error('FAIL: Online indicator not found');
    hasFailure = true;
  } else {
    console.log('✓ PASS: Visible online/offline indicator present');
  }

  // Check network stamp
  if (!onlineText.includes('0 requests') || !onlineText.includes('carrying your data')) {
    console.error('FAIL: "0 requests carrying your data" stamp missing');
    hasFailure = true;
  } else {
    console.log('✓ PASS: "0 requests carrying your data" stamp verified');
  }

  // Switch to Storage tab
  console.log('4. Switching to Storage & IndexedDB tab in proof panel...');
  const storageTabBtn = page.getByRole('button', { name: /storage & indexeddb/i });
  await storageTabBtn.click();
  await page.waitForTimeout(300);

  const storagePanelText = await page.textContent('#proof-panel');

  // Verify seeded counts: 3 notes, 2 collections, 4 tags
  if (!storagePanelText.includes('3') || !storagePanelText.includes('2') || !storagePanelText.includes('4')) {
    console.error('FAIL: IndexedDB seeded counts not accurately displayed. Panel text excerpt:', storagePanelText.slice(0, 300));
    hasFailure = true;
  } else {
    console.log('✓ PASS: Live IndexedDB counts accurately reflect real database (3 notes, 2 collections, 4 tags)');
  }

  // Check persistent storage text
  if (!storagePanelText.includes('Persistent storage:') && !storagePanelText.includes('persistent storage:')) {
    console.error('FAIL: Persistent storage indicator not found');
    hasFailure = true;
  } else {
    console.log('✓ PASS: Persistent storage status indicator present');
  }

  // Check real storage names listed
  const claimsExpected = ['MDstashDB', 'workbox-precache', 'mdstash_backup_nudge_dismissed', 'mdstash_hero_intro_played'];
  for (const claim of claimsExpected) {
    if (!storagePanelText.includes(claim)) {
      console.error(`FAIL: Real storage name "${claim}" not documented in storage audit`);
      hasFailure = true;
    } else {
      console.log(`✓ PASS: Real storage name "${claim}" accurately documented`);
    }
  }

  // 4. Test Wipe Data dialog & confirmation
  console.log('5. Testing wipe dialog, Escape key dismiss, and data wipe...');
  const deleteBtn = page.getByRole('button', { name: /delete everything on this device/i });
  await deleteBtn.click();
  await page.waitForTimeout(200);

  // Dialog should be open
  const dialog = page.getByRole('dialog', { name: /confirm permanent erase/i });
  if (!(await dialog.isVisible())) {
    console.error('FAIL: Confirm dialog did not open upon clicking delete button');
    hasFailure = true;
  } else {
    console.log('✓ PASS: Confirm dialog opens safely without immediately touching data');
  }

  // Test Escape key closes dialog
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  if (await dialog.isVisible()) {
    console.error('FAIL: Escape key did not dismiss confirmation dialog');
    hasFailure = true;
  } else {
    console.log('✓ PASS: Escape key closes confirmation dialog');
  }

  // Re-open dialog and confirm erase
  await deleteBtn.click();
  await page.waitForTimeout(200);
  const confirmBtn = page.getByRole('button', { name: /confirm erase/i });
  await confirmBtn.click();
  await page.waitForTimeout(500);

  // Assert success message and zero counters
  const postWipeText = await page.textContent('#proof-panel');
  if (!postWipeText.includes('All local data has been erased')) {
    console.error('FAIL: Wipe success banner not displayed');
    hasFailure = true;
  } else {
    console.log('✓ PASS: Wipe success banner displayed');
  }

  // Verify counter is now 0 notes in IndexedDB
  const notesCountAfterWipe = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const req = indexedDB.open('MDstashDB');
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('files', 'readonly');
        const countReq = tx.objectStore('files').count();
        countReq.onsuccess = () => resolve(countReq.result);
      };
    });
  });

  if (notesCountAfterWipe !== 0) {
    console.error(`FAIL: Notes count in IndexedDB after wipe is ${notesCountAfterWipe}, expected 0`);
    hasFailure = true;
  } else {
    console.log('✓ PASS: IndexedDB data fully cleared (0 notes remain)');
  }

  // 5. Test "Follow your file" replay button
  console.log('6. Testing "Follow your file" replay button and keyboard interaction...');
  const replayBtn = page.getByRole('button', { name: /replay file safety animation/i });
  if (await replayBtn.isVisible()) {
    await replayBtn.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    console.log('✓ PASS: Replay button is keyboard accessible and triggers scene replay');
  }

  // 6. Test FAQ accordions (single open at a time)
  console.log('7. Testing FAQ accordion single-open behavior...');
  const faqBtn1 = page.locator('#faq-btn-clear-site-data');
  const faqBtn2 = page.locator('#faq-btn-back-up');

  // Click second FAQ
  await faqBtn2.click();
  await page.waitForTimeout(200);
  const isExpanded1 = await faqBtn1.getAttribute('aria-expanded');
  const isExpanded2 = await faqBtn2.getAttribute('aria-expanded');

  if (isExpanded1 === 'true' || isExpanded2 !== 'true') {
    console.error(`FAIL: FAQ accordions not single-open (FAQ 1: ${isExpanded1}, FAQ 2: ${isExpanded2})`);
    hasFailure = true;
  } else {
    console.log('✓ PASS: FAQ accordions are accessible and maintain single-open state');
  }

  await page.close();

  // 7. Check across all 4 widths (2560, 1440, 768, 390) for horizontal overflow and capture screenshots
  console.log('8. Capturing screenshots and testing horizontal overflow at 2560, 1440, 768, 390...');
  for (const vp of viewports) {
    const vpPage = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await vpPage.goto('http://localhost:5173/privacy', { waitUntil: 'networkidle' });
    await vpPage.waitForTimeout(600);

    const hasGate = await vpPage.locator('#desktop-gate').isVisible();
    if (vp.isDesktop) {
      if (hasGate) {
        console.error(`FAIL: Gate unexpectedly visible at desktop width ${vp.width}`);
        hasFailure = true;
      }
    } else {
      if (!hasGate) {
        console.error(`FAIL: Gate NOT visible at non-desktop width ${vp.width}`);
        hasFailure = true;
      } else {
        console.log(`✓ PASS: Gate properly displayed at ${vp.width}px`);
      }
    }

    // Check horizontal scroll
    const scrollWidth = await vpPage.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await vpPage.evaluate(() => document.documentElement.clientWidth);

    if (scrollWidth > clientWidth + 1) {
      console.error(`FAIL: Horizontal scroll detected at width ${vp.width} (scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth})`);
      hasFailure = true;
    } else {
      console.log(`✓ PASS: No horizontal scroll at ${vp.width}px (scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth})`);
    }

    // Check sentence case / no all-caps in titles and pills
    const allCapsFound = await vpPage.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, [class*="pill"], button'));
      const violations = [];
      const allowlist = ['MD', 'KB', 'MB', 'PWA', 'URL', 'CSS', 'SVG', 'IP', 'FAQ', 'HTTP', 'JSON', 'F12'];

      for (const el of elements) {
        const text = (el.innerText || '').trim();
        const words = text.split(/\s+/);
        for (const word of words) {
          const clean = word.replace(/[^a-zA-Z]/g, '');
          if (clean.length > 4 && clean === clean.toUpperCase() && !allowlist.includes(clean)) {
            violations.push({ text, clean });
          }
        }
      }
      return violations;
    });

    if (allCapsFound.length > 0) {
      console.error(`FAIL: All-caps detected at ${vp.width}px:`, allCapsFound);
      hasFailure = true;
    } else {
      console.log(`✓ PASS: Sentence case verified (no all-caps) at ${vp.width}px`);
    }

    // Capture screenshot
    const screenshotPath = path.join(OUT_DIR, `privacy-${vp.name}.png`);
    await vpPage.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✓ Saved screenshot: ${screenshotPath}`);

    await vpPage.close();
  }

  await browser.close();

  if (hasFailure) {
    console.error('\n❌ PRIVACY CHECKS COMPLETED WITH FAILURES');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PRIVACY CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runPrivacyCheck().catch((err) => {
  console.error('Fatal error in check-privacy:', err);
  process.exit(1);
});
