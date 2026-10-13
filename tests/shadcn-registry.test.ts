import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 2 — Shadcn Registry & Build Artifacts Conformance', () => {
  const publicDir = path.join(__dirname, '../public');
  const registryDir = path.join(publicDir, 'r');
  const thumbsDir = path.join(publicDir, 'thumbs');

  it('generates valid shadcn registry items matching the official registry schema', () => {
    expect(fs.existsSync(registryDir)).toBe(true);
    const registryFiles = fs.readdirSync(registryDir).filter((f) => f.endsWith('.json') && f !== 'index.json');

    expect(registryFiles.length).toBe(300);

    // Verify sample item
    const samplePath = path.join(registryDir, registryFiles[0]);
    const item = JSON.parse(fs.readFileSync(samplePath, 'utf8'));

    expect(item).toHaveProperty('$schema', 'https://ui.shadcn.com/schema/registry-item.json');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('type');
    expect(['registry:ui', 'registry:block', 'registry:hook', 'registry:lib']).toContain(item.type);
    expect(item).toHaveProperty('files');
    expect(Array.isArray(item.files)).toBe(true);
    expect(item.files.length).toBeGreaterThan(0);
    expect(item.files[0]).toHaveProperty('path');
    expect(item.files[0]).toHaveProperty('content');
    expect(typeof item.files[0].content).toBe('string');
    expect(item.files[0].content.length).toBeGreaterThan(10);

    // Metadata checks
    expect(item).toHaveProperty('meta');
    expect(item.meta).toHaveProperty('license');
    expect(item.meta).toHaveProperty('attribution');
    expect(item.meta).toHaveProperty('source');
  });

  it('generates a compliant registry index (index.json)', () => {
    const indexPath = path.join(registryDir, 'index.json');
    expect(fs.existsSync(indexPath)).toBe(true);

    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    expect(Array.isArray(index)).toBe(true);
    expect(index.length).toBe(300);

    const first = index[0];
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('type');
    expect(first).toHaveProperty('dependencies');
  });

  it('guarantees 100% thumbnail coverage for all ready components in Pilot Set', () => {
    const pilotPath = path.join(publicDir, 'pilot-catalog.json');
    const pilotCatalog = JSON.parse(fs.readFileSync(pilotPath, 'utf8'));

    const readyItems = pilotCatalog.filter((c: any) => c.previewStatus === 'ready');
    expect(readyItems.length).toBe(46);

    for (const item of readyItems) {
      const thumbPath = path.join(thumbsDir, `${item.id}.webp`);
      expect(fs.existsSync(thumbPath)).toBe(true);

      const stats = fs.statSync(thumbPath);
      // Budget check: <= 15 KB
      expect(stats.size).toBeLessThanOrEqual(15 * 1024);
      expect(stats.size).toBeGreaterThan(100);
    }
  });

  it('generates a valid Cloudflare D1 seed SQL file containing schema and all Pilot components', () => {
    const d1SeedPath = path.join(publicDir, 'd1-seed.sql');
    expect(fs.existsSync(d1SeedPath)).toBe(true);

    const sqlContent = fs.readFileSync(d1SeedPath, 'utf8');
    expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS components');
    expect(sqlContent).toContain('CREATE VIRTUAL TABLE IF NOT EXISTS components_fts');
    expect(sqlContent).toContain('INSERT OR REPLACE INTO components');

    // Count component insert statements
    const insertCount = (sqlContent.match(/INSERT OR REPLACE INTO components/g) || []).length;
    expect(insertCount).toBe(300);
  });
});
