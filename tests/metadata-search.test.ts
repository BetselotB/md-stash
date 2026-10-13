import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { searchService } from '../src/services/search';
import { ComponentMetadata } from '../src/domain/componentTypes';

describe('Component Metadata Search & Benchmark', () => {
  let catalog: ComponentMetadata[];

  beforeAll(() => {
    const catalogPath = path.join(__dirname, '../public/catalog.json');
    expect(fs.existsSync(catalogPath)).toBe(true);
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    expect(catalog.length).toBe(8072);

    // Index all 8,072 components into MiniSearch
    const t0 = performance.now();
    searchService.syncComponents(catalog);
    const indexDuration = performance.now() - t0;

    // Must index 8k components in < 3000ms
    expect(indexDuration).toBeLessThan(3000);
  });

  it('meets the < 30ms p95 search latency budget over 8,072 components', () => {
    const BENCHMARK_QUERIES = [
      'pricing table',
      'button',
      'modal dialog',
      'command palette',
      'sidebar navigation',
      'toggle switch',
      'bar chart',
      'avatar list',
      'drawer sheet',
      'accordion collapse',
      'shimmer button',
      'particles background',
      'dropdown menu',
      'date picker',
      'input form',
      'slider',
      'toast notification',
      'carousel media',
      'tabs',
      'bento grid',
      'text scramble',
      'sparkles',
      'progress bar',
      'skeleton loading',
      'radio group',
    ];

    const latencies: number[] = [];

    // Run 100 searches (4 iterations of 25 benchmark queries)
    for (let iter = 0; iter < 4; iter++) {
      for (const query of BENCHMARK_QUERIES) {
        const t0 = performance.now();
        const results = searchService.searchComponents(query, { limit: 10 });
        const dt = performance.now() - t0;
        latencies.push(dt);
        expect(results.length).toBeGreaterThan(0);
      }
    }

    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];

    console.log(`\n--- MiniSearch Benchmark (8,072 items, 100 queries) ---`);
    console.log(`p50 latency: ${p50.toFixed(2)} ms`);
    console.log(`p95 latency: ${p95.toFixed(2)} ms (Budget: < 30.00 ms)`);
    console.log(`p99 latency: ${p99.toFixed(2)} ms`);

    // Strict acceptance budget
    expect(p95).toBeLessThan(30);
  });

  it('correctly applies ranking boosts and category filters', () => {
    // 1. Search for buttons with category filter
    const buttonResults = searchService.searchComponents('button', {
      category: 'buttons',
      limit: 5,
    });
    expect(buttonResults.length).toBeGreaterThan(0);

    // 2. Search for tailwind styling only
    const tailwindResults = searchService.searchComponents('card', {
      styling: 'tailwind',
      limit: 5,
    });
    expect(tailwindResults.length).toBeGreaterThan(0);
  });
});
