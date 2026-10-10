import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

// Configuration
const BASE_URL = process.env.URL || 'http://localhost:5173';
const DEFAULT_VIEWPORT = { width: 1920, height: 1080 };

// Percentile helper
function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(Math.floor((p / 100) * sorted.length), sorted.length - 1);
  return sorted[idx];
}

// Format duration
function fmt(n) {
  return typeof n === 'number' ? n.toFixed(2) : '0.00';
}

// Identify section from scrollY position
function getRegionForY(y, sectionBounds) {
  if (!sectionBounds) return 'unknown';
  if (y < sectionBounds.curtain) return 'hero';
  if (y < sectionBounds.howItWorks) return 'sage-to-cream transition';
  if (y < sectionBounds.features) return 'how it works';
  if (y < sectionBounds.playground) return 'features marquee';
  if (y < sectionBounds.privacy) return 'playground';
  return 'privacy/final sections';
}

/**
 * Runs a scroll test session
 */
export async function runScrollSession({
  viewport = DEFAULT_VIEWPORT,
  cpuThrottle = 1,
  perfQuery = '',
  port = 5173,
  captureScreenshotsDir = null,
  isAblation = false,
  traceProfile = true,
}) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-experimental-web-platform-features'],
  });

  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // Install listener tracker & frame metrics recorder before any script runs
  await page.addInitScript(() => {
    window.__nonPassiveListeners = [];
    const origAdd = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (['scroll', 'wheel', 'mousewheel', 'touchstart', 'touchmove', 'resize'].includes(type)) {
        const isPassive =
          typeof options === 'object' && options !== null ? Boolean(options.passive) : false;
        if (!isPassive) {
          window.__nonPassiveListeners.push({
            type,
            target: this instanceof Element ? (this.id || this.className || this.tagName) : (this.constructor?.name || 'window'),
          });
        }
      }
      return origAdd.call(this, type, listener, options);
    };

    window.__frameSamples = [];
    window.__loafEntries = [];
    window.__longTasks = [];

    try {
      const loafObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const scripts = (entry.scripts || []).map((s) => ({
            invoker: s.invoker,
            sourceURL: s.sourceURL,
            sourceFunctionName: s.sourceFunctionName,
            duration: s.duration,
          }));
          window.__loafEntries.push({
            duration: entry.duration,
            startTime: entry.startTime,
            scripts,
          });
        }
      });
      loafObs.observe({ type: 'long-animation-frame', buffered: true });
    } catch {}

    try {
      const ltObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__longTasks.push({
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
          });
        }
      });
      ltObs.observe({ type: 'longtask', buffered: true });
    } catch {}

    let lastRaf = performance.now();
    function trackFrame(now) {
      const delta = now - lastRaf;
      lastRaf = now;
      if (window.__recordingFrames) {
        window.__frameSamples.push({
          time: now,
          delta,
          scrollY: window.scrollY || document.documentElement.scrollTop || 0,
        });
      }
      requestAnimationFrame(trackFrame);
    }
    requestAnimationFrame(trackFrame);
  });

  const client = await context.newCDPSession(page);

  // Set CPU throttling
  if (cpuThrottle > 1) {
    await client.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle });
  }

  await client.send('Performance.enable');

  // Navigate with ?nointro and ablation flags
  const queryParts = ['nointro'];
  if (perfQuery) queryParts.push(`perf=${perfQuery}`);
  const targetUrl = `http://localhost:${port}/?${queryParts.join('&')}`;

  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  // Measure layer tree
  let layerCount = 0;
  let layerMemory = 0;
  try {
    await client.send('LayerTree.enable');
    // Give layers time to stabilize
    await page.waitForTimeout(100);
  } catch {}

  // Get section bounds for region splitting
  const sectionBounds = await page.evaluate(() => {
    const getTop = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    };
    return {
      hero: 0,
      curtain: getTop('#cream-curtain') || 800,
      howItWorks: getTop('#how-it-works') || 1200,
      features: getTop('#features') || 2800,
      playground: getTop('#playground') || 4200,
      privacy: getTop('#privacy-proof') || 5600,
      maxScroll: document.documentElement.scrollHeight - window.innerHeight,
    };
  });

  // Take baseline screenshots if requested
  if (captureScreenshotsDir) {
    fs.mkdirSync(captureScreenshotsDir, { recursive: true });
    const shots = [
      { name: `hero-${viewport.width}`, sel: '#main-content', y: 0 },
      { name: `curtain-${viewport.width}`, sel: '#cream-curtain', y: sectionBounds.curtain },
      { name: `scene1-${viewport.width}`, sel: '[data-panel="1"]', y: sectionBounds.howItWorks },
      { name: `scene2-${viewport.width}`, sel: '[data-panel="2"]', y: sectionBounds.howItWorks + 600 },
      { name: `scene3-${viewport.width}`, sel: '[data-panel="3"]', y: sectionBounds.howItWorks + 1200 },
      { name: `features-${viewport.width}`, sel: '#features', y: sectionBounds.features },
      { name: `playground-${viewport.width}`, sel: '#playground', y: sectionBounds.playground },
    ];

    for (const s of shots) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), s.y);
      await page.waitForTimeout(400);
      const filePath = path.join(captureScreenshotsDir, `${s.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
    }

    // Nav in sage state (y=0) and cream state (y=curtain + 100)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(captureScreenshotsDir, `nav-sage-${viewport.width}.png`) });

    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), sectionBounds.curtain + 200);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(captureScreenshotsDir, `nav-cream-${viewport.width}.png`) });

    // Reset to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
  }

  // Record initial metrics
  const initialPerfMetrics = await client.send('Performance.getMetrics');

  // Start DevTools timeline trace
  const traceEvents = [];
  if (traceProfile) {
    client.on('Tracing.dataCollected', (e) => {
      traceEvents.push(...e.value);
    });
    await client.send('Tracing.start', {
      categories: 'devtools.timeline,disabled-by-default-devtools.timeline',
      options: 'sampling-frequency=10000',
    });
  }

  // Start recording frames
  await page.evaluate(() => {
    window.__recordingFrames = true;
    window.__frameSamples = [];
  });

  const scrollStartTime = Date.now();

  // Scroll through entire page with real mouse.wheel events (~120px every ~16ms)
  // Covered how it works at least 3 times back and forth
  // Sequence:
  // 1. Scroll down from top through How it works to features
  // 2. Scroll up through How it works to curtain
  // 3. Scroll down through How it works to features
  // 4. Scroll up through How it works to curtain
  // 5. Scroll down all the way to bottom of page

  async function wheelScrollTo(targetY, step = 120, delayMs = 16) {
    let currentY = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop || 0);
    const direction = targetY > currentY ? 1 : -1;
    const dy = Math.abs(step) * direction;

    while ((direction > 0 && currentY < targetY) || (direction < 0 && currentY > targetY)) {
      await page.mouse.wheel(0, dy);
      await page.waitForTimeout(delayMs);
      currentY = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop || 0);
    }
  }

  // Run scroll script:
  // Down to features
  await wheelScrollTo(sectionBounds.features + 300);
  // Up to curtain
  await wheelScrollTo(sectionBounds.curtain);
  // Down to features
  await wheelScrollTo(sectionBounds.features + 300);
  // Up to curtain
  await wheelScrollTo(sectionBounds.curtain);
  // Down to end of page
  await wheelScrollTo(sectionBounds.maxScroll);

  const scrollDurationSec = (Date.now() - scrollStartTime) / 1000;

  // Stop recording frames
  await page.evaluate(() => {
    window.__recordingFrames = false;
  });

  // End DevTools trace
  if (traceProfile) {
    await new Promise((resolve) => {
      client.once('Tracing.tracingComplete', resolve);
      client.send('Tracing.end');
    });
  }

  // Final metrics
  const finalPerfMetrics = await client.send('Performance.getMetrics');

  // Snapshot while viewport is inside How it works:
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), sectionBounds.howItWorks + 400);
  await page.waitForTimeout(300);

  const runningStatsInsideHiw = await page.evaluate(() => {
    const statsHelper = window.__getRunningStats ? window.__getRunningStats() : {};
    const win = window;
    const ScrollTrigger = win.ScrollTrigger || win.gsap?.plugins?.ScrollTrigger;
    const allST = ScrollTrigger ? ScrollTrigger.getAll() : [];
    const activeST = allST.filter((st) => st.isActive);

    const activeTweens = win.gsap?.globalTimeline
      ? win.gsap.globalTimeline.getChildren(true, true, false).filter((t) => typeof t.isActive === 'function' ? t.isActive() : false)
      : [];

    return {
      scrollTriggerTotal: allST.length,
      scrollTriggerActive: activeST.length,
      activeTriggersList: activeST.map((st) => st.vars?.id || st.trigger?.id || st.trigger?.className || 'anon'),
      activeTweensCount: activeTweens.length,
      webAnimationsCount: document.getAnimations ? document.getAnimations().length : 0,
      reactRenderCount: window.__reactRenderCount || 0,
      componentRenders: window.__componentRenders || {},
      nonPassiveListeners: window.__nonPassiveListeners || [],
    };
  });

  // Extract recorded frame data
  const frameSamples = await page.evaluate(() => window.__frameSamples || []);
  const loafEntries = await page.evaluate(() => window.__loafEntries || []);
  const longTasks = await page.evaluate(() => window.__longTasks || []);

  await browser.close();

  // Compute metrics deltas
  const getMetric = (list, name) => {
    const m = list.find((item) => item.name === name);
    return m ? m.value : 0;
  };
  const metricDeltas = {};
  [
    'LayoutCount',
    'RecalcStyleCount',
    'LayoutDuration',
    'RecalcStyleDuration',
    'ScriptDuration',
    'TaskDuration',
  ].forEach((k) => {
    metricDeltas[k] = getMetric(finalPerfMetrics.metrics, k) - getMetric(initialPerfMetrics.metrics, k);
  });

  // Frame time statistics
  const frameDeltas = frameSamples.map((s) => s.delta).filter((d) => d > 0 && d < 1000);
  const p50 = percentile(frameDeltas, 50);
  const p95 = percentile(frameDeltas, 95);
  const p99 = percentile(frameDeltas, 99);
  const framesOver16_7 = frameDeltas.filter((d) => d > 16.7).length;
  const framesOver33 = frameDeltas.filter((d) => d > 33.3).length;
  const framesOver50 = frameDeltas.filter((d) => d > 50).length;
  const worstFrame = frameDeltas.length ? Math.max(...frameDeltas) : 0;
  const droppedFramePct = frameDeltas.length ? (framesOver16_7 / frameDeltas.length) * 100 : 0;

  // Regional breakdown
  const regionalFrames = {
    hero: [],
    'sage-to-cream transition': [],
    'how it works': [],
    'features marquee': [],
    playground: [],
    'privacy/final sections': [],
  };

  frameSamples.forEach((s) => {
    const reg = getRegionForY(s.scrollY, sectionBounds);
    if (regionalFrames[reg]) regionalFrames[reg].push(s.delta);
  });

  const regionalStats = {};
  Object.keys(regionalFrames).forEach((reg) => {
    const deltas = regionalFrames[reg].filter((d) => d > 0 && d < 1000);
    regionalStats[reg] = {
      count: deltas.length,
      p50: percentile(deltas, 50),
      p95: percentile(deltas, 95),
      p99: percentile(deltas, 99),
      over16: deltas.filter((d) => d > 16.7).length,
      over33: deltas.filter((d) => d > 33.3).length,
      over50: deltas.filter((d) => d > 50).length,
      worst: deltas.length ? Math.max(...deltas) : 0,
      droppedPct: deltas.length ? (deltas.filter((d) => d > 16.7).length / deltas.length) * 100 : 0,
    };
  });

  // Trace breakdown
  let timeScripting = 0;
  let timeStyle = 0;
  let timeLayout = 0;
  let timePaint = 0;
  let timeComposite = 0;
  let paintEventCount = 0;
  let paintAreaTotal = 0;

  // Trace slicing specifically for How It Works section
  let hiwMainThreadMs = 0;
  let hiwEventsCount = 0;
  const hiwStart = sectionBounds.howItWorks;
  const hiwEnd = sectionBounds.features;
  const hiwSamples = frameSamples.filter((s) => s.scrollY >= hiwStart && s.scrollY <= hiwEnd);

  // Time window for when scroll was inside How It Works
  const hiwTimeRanges = [];
  let inHiw = false;
  let rangeStart = 0;
  frameSamples.forEach((s) => {
    const isInside = s.scrollY >= hiwStart && s.scrollY <= hiwEnd;
    if (isInside && !inHiw) {
      inHiw = true;
      rangeStart = s.time;
    } else if (!isInside && inHiw) {
      inHiw = false;
      hiwTimeRanges.push([rangeStart, s.time]);
    }
  });
  if (inHiw && frameSamples.length) {
    hiwTimeRanges.push([rangeStart, frameSamples[frameSamples.length - 1].time]);
  }

  traceEvents.forEach((ev) => {
    const durMs = (ev.dur || 0) / 1000;
    const name = ev.name;

    let isMainThreadEvent = false;
    if (name === 'FunctionCall' || name === 'EvaluateScript' || name === 'v8.compile' || name === 'TimerFire' || name === 'FireAnimationFrame') {
      timeScripting += durMs;
      isMainThreadEvent = true;
    } else if (name === 'UpdateLayoutTree' || name === 'RecalculateStyles') {
      timeStyle += durMs;
      isMainThreadEvent = true;
    } else if (name === 'Layout') {
      timeLayout += durMs;
      isMainThreadEvent = true;
    } else if (name === 'Paint') {
      timePaint += durMs;
      paintEventCount++;
      isMainThreadEvent = true;
    } else if (name === 'CompositeLayers' || name === 'RasterTask' || name === 'Rasterize') {
      timeComposite += durMs;
      isMainThreadEvent = true;
    }

    if (isMainThreadEvent && ev.ts) {
      // Check if event falls inside How It Works time window
      // ev.ts is in microseconds
      const evMs = (ev.ts - (traceEvents[0]?.ts || 0)) / 1000;
      // Also check against relative scroll duration
      const isInsideHiw = hiwTimeRanges.some(([t0, t1]) => {
        const offset0 = t0 - (frameSamples[0]?.time || 0);
        const offset1 = t1 - (frameSamples[0]?.time || 0);
        return evMs >= offset0 && evMs <= offset1;
      });
      if (isInsideHiw) {
        hiwMainThreadMs += durMs;
        hiwEventsCount++;
      }
    }
  });

  const totalMainThreadMs = timeScripting + timeStyle + timeLayout + timePaint + timeComposite;
  const mainThreadPerFrame = frameDeltas.length ? totalMainThreadMs / frameDeltas.length : 0;
  const hiwMainThreadPerFrame = hiwSamples.length ? (hiwMainThreadMs || (totalMainThreadMs * (hiwSamples.length / (frameDeltas.length || 1)))) / hiwSamples.length : 0;

  return {
    viewport: `${viewport.width}x${viewport.height}`,
    cpuThrottle: `${cpuThrottle}x`,
    perfQuery: perfQuery || 'baseline',
    scrollDurationSec,
    totalFrames: frameDeltas.length,
    p50,
    p95,
    p99,
    worstFrame,
    framesOver16_7,
    framesOver33,
    framesOver50,
    droppedFramePct,
    mainThreadPerFrame,
    hiwMainThreadPerFrame,
    paintDurationMs: timePaint,
    paintEventCount,
    metricDeltas,
    timeBreakdown: {
      scripting: timeScripting,
      style: timeStyle,
      layout: timeLayout,
      paint: timePaint,
      composite: timeComposite,
      total: totalMainThreadMs,
    },
    regionalStats,
    loaf: {
      count: loafEntries.length,
      totalDur: loafEntries.reduce((sum, e) => sum + e.duration, 0),
      maxDur: loafEntries.length ? Math.max(...loafEntries.map((e) => e.duration)) : 0,
      entries: loafEntries,
    },
    longTasks: {
      count: longTasks.length,
      totalDur: longTasks.reduce((sum, e) => sum + e.duration, 0),
      maxDur: longTasks.length ? Math.max(...longTasks.map((e) => e.duration)) : 0,
    },
    runningStatsInsideHiw,
  };
}

// CLI runner
async function main() {
  const args = process.argv.slice(2);
  const port = Number(process.env.PORT) || 5173;

  if (args.includes('--capture-baseline')) {
    console.log('Capturing baseline screenshots into scripts/out/perf-before/...');
    const outDir = path.resolve('scripts/out/perf-before');
    await runScrollSession({
      viewport: { width: 1440, height: 900 },
      port,
      captureScreenshotsDir: outDir,
      traceProfile: false,
    });
    await runScrollSession({
      viewport: { width: 2560, height: 1440 },
      port,
      captureScreenshotsDir: outDir,
      traceProfile: false,
    });
    console.log('Baseline screenshots captured successfully!');
    return;
  }

  if (args.includes('--ablation')) {
    console.log('========================================================================================');
    console.log('STEP 1: ABLATION STUDY — SYSTEMATIC SUSPECT ISOLATION');
    console.log('========================================================================================\n');

    const flagsToTest = [
      '', // baseline
      'nograin',
      'noblend',
      'noglass',
      'noshadow',
      'nopath',
      'noanims',
      'nostate',
      'nolenis',
    ];

    const results = [];
    for (const flag of flagsToTest) {
      const label = flag || 'baseline';
      console.log(`Running ablation for [${label}] at 4x CPU throttle...`);
      const res = await runScrollSession({
        viewport: DEFAULT_VIEWPORT,
        cpuThrottle: 4,
        perfQuery: flag,
        port,
        traceProfile: true,
      });
      results.push({ label, res });
    }

    const baseline = results[0].res;

    console.log('\n========================================================================================');
    console.log('ABLATION MATRIX: 1920x1080 @ 4x CPU THROTTLE');
    console.log('========================================================================================');
    console.log(
      'Flag'.padEnd(12) +
      ' | ' + 'p95 (ms)'.padEnd(10) +
      ' | ' + 'Dropped %'.padEnd(11) +
      ' | ' + 'MainThread/Frame'.padEnd(18) +
      ' | ' + 'PaintArea/sec'.padEnd(16) +
      ' | ' + 'Saved vs Baseline'
    );
    console.log('-'.repeat(90));

    const ranked = [];

    for (const item of results) {
      const r = item.res;
      const savedP95 = baseline.p95 - r.p95;
      const savedPct = ((baseline.p95 - r.p95) / baseline.p95) * 100;
      ranked.push({
        label: item.label,
        p95: r.p95,
        droppedPct: r.droppedFramePct,
        mainThreadPerFrame: r.mainThreadPerFrame,
        paintAreaPerSec: r.paintAreaPerSec,
        savedP95,
        savedPct,
      });

      console.log(
        item.label.padEnd(12) +
        ' | ' + fmt(r.p95).padStart(8) + 'ms' +
        ' | ' + (fmt(r.droppedFramePct) + '%').padStart(10) +
        ' | ' + (fmt(r.mainThreadPerFrame) + 'ms').padStart(16) +
        ' | ' + (Math.round(r.paintAreaPerSec).toLocaleString() + ' px²/s').padStart(15) +
        ' | ' + (item.label === 'baseline' ? 'BASELINE' : (savedP95 > 0 ? `-${fmt(savedP95)}ms (${fmt(savedPct)}%)` : `+${fmt(-savedP95)}ms`))
      );
    }

    console.log('\n========================================================================================');
    console.log('RANKED SUSPECTS BY MEASURED IMPACT (MOST TO LEAST SAVED):');
    console.log('========================================================================================');
    const sorted = [...ranked.slice(1)].sort((a, b) => b.savedP95 - a.savedP95);
    sorted.forEach((s, idx) => {
      console.log(
        `${idx + 1}. [${s.label}]: p95 dropped from ${fmt(baseline.p95)}ms -> ${fmt(s.p95)}ms (Saves ${fmt(s.savedP95)}ms / ${fmt(s.savedPct)}%), Paint Area: ${Math.round(s.paintAreaPerSec).toLocaleString()} px²/s`
      );
    });

    return;
  }

  // Helper to run 3 times and compute median of metrics
  async function run3Medians(cpuThrottle) {
    console.log(`\nRunning 3 trials @ ${cpuThrottle}x CPU to compute stable medians...`);
    const trials = [];
    for (let i = 0; i < 3; i++) {
      process.stdout.write(`  Trial ${i + 1}/3... `);
      const res = await runScrollSession({ viewport: DEFAULT_VIEWPORT, cpuThrottle, port });
      const hiw = res.regionalStats['how it works'] || {};
      trials.push({
        p95: res.p95,
        droppedPct: res.droppedFramePct,
        hiwP95: hiw.p95 || res.p95,
        hiwDroppedPct: hiw.droppedPct || res.droppedFramePct,
        hiwMainThreadPerFrame: res.hiwMainThreadPerFrame || res.mainThreadPerFrame,
        mainThreadPerFrame: res.mainThreadPerFrame,
        res,
      });
      console.log(`done (p95: ${fmt(res.p95)}ms, HIW p95: ${fmt(hiw.p95)}ms, HIW dropped: ${fmt(hiw.droppedPct)}%)`);
    }

    const medianOf = (arr, key) => {
      const vals = arr.map((t) => t[key]).sort((a, b) => a - b);
      return vals[1]; // middle element of 3
    };

    return {
      p95: medianOf(trials, 'p95'),
      droppedPct: medianOf(trials, 'droppedPct'),
      hiwP95: medianOf(trials, 'hiwP95'),
      hiwDroppedPct: medianOf(trials, 'hiwDroppedPct'),
      hiwMainThreadPerFrame: medianOf(trials, 'hiwMainThreadPerFrame'),
      mainThreadPerFrame: medianOf(trials, 'mainThreadPerFrame'),
      raw: trials[1].res,
    };
  }

  if (args.includes('--medians')) {
    const m1x = await run3Medians(1);
    const m4x = await run3Medians(4);

    console.log('\n========================================================================================');
    console.log('MEDIAN BENCHMARK REPORT (HOW IT WORKS PRIORITY REGION):');
    console.log('========================================================================================');
    console.log(`1x CPU:`);
    console.log(`  Overall:       p95 = ${fmt(m1x.p95)}ms | Dropped (>16.7ms) = ${fmt(m1x.droppedPct)}% | Main-thread = ${fmt(m1x.mainThreadPerFrame)}ms/frame`);
    console.log(`  How It Works:  p95 = ${fmt(m1x.hiwP95)}ms | Dropped (>16.7ms) = ${fmt(m1x.hiwDroppedPct)}% | Main-thread = ${fmt(m1x.hiwMainThreadPerFrame)}ms/frame`);
    console.log(`\n4x CPU:`);
    console.log(`  Overall:       p95 = ${fmt(m4x.p95)}ms | Dropped (>16.7ms) = ${fmt(m4x.droppedPct)}% | Main-thread = ${fmt(m4x.mainThreadPerFrame)}ms/frame`);
    console.log(`  How It Works:  p95 = ${fmt(m4x.hiwP95)}ms | Dropped (>16.7ms) = ${fmt(m4x.hiwDroppedPct)}% | Main-thread = ${fmt(m4x.hiwMainThreadPerFrame)}ms/frame`);
    return;
  }

  // Normal run: runs 1x and 4x CPU throttle, prints comprehensive report
  console.log('========================================================================================');
  console.log('MEASURING LANDING PAGE SCROLL PERFORMANCE (BASE RUN)');
  console.log('========================================================================================\n');

  console.log('Running 1x CPU (Normal)...');
  const res1x = await runScrollSession({ viewport: DEFAULT_VIEWPORT, cpuThrottle: 1, port });

  console.log('\nRunning 4x CPU Throttle...');
  const res4x = await runScrollSession({ viewport: DEFAULT_VIEWPORT, cpuThrottle: 4, port });

  console.log('\n========================================================================================');
  console.log('GLOBAL FRAME TIME SUMMARY (1920x1080)');
  console.log('========================================================================================');
  console.log(`1x CPU: p50=${fmt(res1x.p50)}ms | p95=${fmt(res1x.p95)}ms | p99=${fmt(res1x.p99)}ms | Worst=${fmt(res1x.worstFrame)}ms | Dropped(>16.7ms)=${fmt(res1x.droppedFramePct)}% (${res1x.framesOver16_7}/${res1x.totalFrames}) | >33ms=${res1x.framesOver33} | >50ms=${res1x.framesOver50}`);
  console.log(`4x CPU: p50=${fmt(res4x.p50)}ms | p95=${fmt(res4x.p95)}ms | p99=${fmt(res4x.p99)}ms | Worst=${fmt(res4x.worstFrame)}ms | Dropped(>16.7ms)=${fmt(res4x.droppedFramePct)}% (${res4x.framesOver16_7}/${res4x.totalFrames}) | >33ms=${res4x.framesOver33} | >50ms=${res4x.framesOver50}`);

  console.log('\n========================================================================================');
  console.log('PER-REGION BREAKDOWN (4x CPU THROTTLE)');
  console.log('========================================================================================');
  console.log('Region'.padEnd(28) + ' | ' + 'p50'.padEnd(8) + ' | ' + 'p95'.padEnd(8) + ' | ' + 'Worst'.padEnd(8) + ' | ' + '>16.7ms'.padEnd(10) + ' | ' + '>33.3ms'.padEnd(10) + ' | ' + '>50ms');
  console.log('-'.repeat(85));
  Object.entries(res4x.regionalStats).forEach(([region, s]) => {
    console.log(
      region.padEnd(28) + ' | ' +
      (fmt(s.p50) + 'ms').padEnd(8) + ' | ' +
      (fmt(s.p95) + 'ms').padEnd(8) + ' | ' +
      (fmt(s.worst) + 'ms').padEnd(8) + ' | ' +
      (s.over16 + ` (${fmt(s.droppedPct)}%)`).padEnd(10) + ' | ' +
      (s.over33 + '').padEnd(10) + ' | ' +
      s.over50
    );
  });

  console.log('\n========================================================================================');
  console.log('MAIN-THREAD WORK BREAKDOWN & TRACE SUMMARY (4x CPU)');
  console.log('========================================================================================');
  console.log(`Scripting:          ${fmt(res4x.timeBreakdown.scripting)} ms`);
  console.log(`Style Recalc:       ${fmt(res4x.timeBreakdown.style)} ms`);
  console.log(`Layout:             ${fmt(res4x.timeBreakdown.layout)} ms`);
  console.log(`Paint:              ${fmt(res4x.timeBreakdown.paint)} ms (${res4x.paintEventCount} paint events)`);
  console.log(`Composite/Raster:   ${fmt(res4x.timeBreakdown.composite)} ms`);
  console.log(`Total Main-Thread:  ${fmt(res4x.timeBreakdown.total)} ms (${fmt(res4x.mainThreadPerFrame)} ms/frame)`);
  console.log(`Paint Area / Sec:   ${Math.round(res4x.paintAreaPerSec).toLocaleString()} px²/sec`);

  console.log('\nCDP Performance Metrics Deltas:');
  console.log(`  LayoutCount:        ${res4x.metricDeltas.LayoutCount}`);
  console.log(`  RecalcStyleCount:   ${res4x.metricDeltas.RecalcStyleCount}`);
  console.log(`  LayoutDuration:     ${fmt(res4x.metricDeltas.LayoutDuration * 1000)} ms`);
  console.log(`  RecalcStyleDuration:${fmt(res4x.metricDeltas.RecalcStyleDuration * 1000)} ms`);
  console.log(`  ScriptDuration:     ${fmt(res4x.metricDeltas.ScriptDuration * 1000)} ms`);
  console.log(`  TaskDuration:       ${fmt(res4x.metricDeltas.TaskDuration * 1000)} ms`);

  console.log('\n========================================================================================');
  console.log('WHAT IS STILL RUNNING WHILE VIEWPORT IS INSIDE HOW-IT-WORKS:');
  console.log('========================================================================================');
  const running = res4x.runningStatsInsideHiw;
  console.log(`ScrollTrigger Total:           ${running.scrollTriggerTotal}`);
  console.log(`ScrollTrigger Active:          ${running.scrollTriggerActive} (${running.activeTriggersList.join(', ')})`);
  console.log(`GSAP Active Tweens / Timelines:${running.activeTweensCount}`);
  console.log(`Web Animations (CSS/WAAPI):    ${running.webAnimationsCount}`);
  console.log(`React Renders During Scroll:   ${running.reactRenderCount}`);
  console.log(`Non-Passive Listeners:         ${running.nonPassiveListeners.length ? JSON.stringify(running.nonPassiveListeners) : 'None (All passive)'}`);

  // Write full JSON report
  fs.mkdirSync('scripts/out', { recursive: true });
  fs.writeFileSync('scripts/out/perf-baseline.json', JSON.stringify({ res1x, res4x }, null, 2));
  console.log('\nReport written to scripts/out/perf-baseline.json');
}

main().catch((err) => {
  console.error('perf-scroll failed:', err);
  process.exit(1);
});
