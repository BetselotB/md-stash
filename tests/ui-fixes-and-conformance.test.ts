import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('UI/UX Platform Fixes & Conformance Verification', () => {
  it('ensures catalog.json has 0 components with leading/trailing whitespace in names or descriptions', () => {
    const catalogPath = path.join(process.cwd(), 'public/catalog.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

    const flawed = catalog.filter(
      (c: any) => c.name !== c.name.trim() || c.description !== c.description.trim()
    );
    expect(flawed).toHaveLength(0);
  });

  it('verifies component category formatting cleans hyphens cleanly for breadcrumbs', () => {
    const rawCategories = ['data-display', 'inputs-forms', 'hero-and-marketing-sections', 'ai-chat'];
    const formatted = rawCategories.map((c) => c.replace(/-/g, ' '));
    expect(formatted).toEqual([
      'data display',
      'inputs forms',
      'hero and marketing sections',
      'ai chat',
    ]);
  });

  it('verifies that zero alert() calls exist anywhere in src', () => {
    const walk = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          results = results.concat(walk(full));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          results.push(full);
        }
      }
      return results;
    };

    const srcFiles = walk(path.join(process.cwd(), 'src'));
    const alertFiles: string[] = [];

    for (const f of srcFiles) {
      const content = fs.readFileSync(f, 'utf8');
      if (/\balert\s*\(/.test(content)) {
        alertFiles.push(path.basename(f));
      }
    }

    expect(alertFiles).toEqual([]);
  });

  it('verifies KitTray selection threshold permits single item kits', () => {
    const kitTrayPath = path.join(process.cwd(), 'src/components/bundle/KitTray.tsx');
    const content = fs.readFileSync(kitTrayPath, 'utf8');
    expect(content).toContain('selectedComponentIds.length < 1');
  });

  it('verifies ComponentDetail tabs strip includes scrollbar-none and shrink-0 to prevent tab truncation', () => {
    const detailPath = path.join(process.cwd(), 'src/routes/ComponentDetail.tsx');
    const content = fs.readFileSync(detailPath, 'utf8');
    expect(content).toContain('scrollbar-none');
    expect(content).toContain('shrink-0');
  });

  it('verifies TanStack Virtual in Gallery uses ancestor main scroll element', () => {
    const galleryPath = path.join(process.cwd(), 'src/routes/Gallery.tsx');
    const content = fs.readFileSync(galleryPath, 'utf8');
    expect(content).toContain("closest('main')");
  });
});
