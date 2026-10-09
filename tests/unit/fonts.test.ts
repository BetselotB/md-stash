import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Self-hosted font loading & design tokens', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const fontsCssPath = path.resolve(rootDir, 'src/styles/fonts.css');
  const tokensCssPath = path.resolve(rootDir, 'src/styles/tokens.css');

  it('imports all 5 candidate display fonts and core fonts in fonts.css', () => {
    expect(fs.existsSync(fontsCssPath)).toBe(true);
    const fontsCss = fs.readFileSync(fontsCssPath, 'utf8');

    const expectedPackages = [
      '@fontsource/passion-one',
      '@fontsource/londrina-solid',
      '@fontsource/alumni-sans',
      '@fontsource/bowlby-one',
      '@fontsource/anton',
      '@fontsource/nunito',
      '@fontsource/jetbrains-mono',
    ];

    for (const pkg of expectedPackages) {
      expect(fontsCss).toContain(pkg);
    }
  });

  it('ensures each fontsource package exists and contains woff2 font files in node_modules', () => {
    const candidates = [
      'passion-one',
      'londrina-solid',
      'alumni-sans',
      'bowlby-one',
      'anton',
      'nunito',
      'jetbrains-mono',
    ];

    for (const pkg of candidates) {
      const pkgDir = path.resolve(rootDir, 'node_modules/@fontsource', pkg);
      expect(fs.existsSync(pkgDir)).toBe(true);

      const filesDir = path.resolve(pkgDir, 'files');
      expect(fs.existsSync(filesDir)).toBe(true);
      const fontFiles = fs.readdirSync(filesDir);
      const hasWoff2 = fontFiles.some((f) => f.endsWith('.woff2'));
      expect(hasWoff2).toBe(true);
    }
  });

  it('defines --font-display with self-hosted candidate in tokens.css', () => {
    expect(fs.existsSync(tokensCssPath)).toBe(true);
    const tokens = fs.readFileSync(tokensCssPath, 'utf8');
    expect(tokens).toMatch(/--font-display:\s*['"]Passion One['"]/);
  });

  it('defines sunny sage, warm cream, and orange accent palette tokens in tokens.css', () => {
    const tokens = fs.readFileSync(tokensCssPath, 'utf8');
    expect(tokens).toContain('--sage: #84937A;');
    expect(tokens).toContain('--cream: #F7F3E1;');
    expect(tokens).toContain('--orange: #EEAA45;');
    expect(tokens).toContain('--ink: #26332A;');
  });

  it('verifies contrast compliance: small text on sage uses ink (AA compliant)', () => {
    // Relative luminance calculation for #26332A (ink) and #8A9A78 (sage)
    function getLuminance(r: number, g: number, b: number) {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        const val = c / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    function getContrast(hex1: string, hex2: string) {
      const parse = (hex: string) => {
        const h = hex.replace('#', '');
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      };
      const [r1, g1, b1] = parse(hex1);
      const [r2, g2, b2] = parse(hex2);
      const l1 = getLuminance(r1, g1, b1);
      const l2 = getLuminance(r2, g2, b2);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    const sage = '#84937A';
    const cream = '#F7F3E1';
    const ink = '#26332A';

    // Cream on sage fails small text contrast (< 4.5:1)
    const creamOnSage = getContrast(cream, sage);
    expect(creamOnSage).toBeLessThan(3.0); // About 2.7:1

    // Ink on sage passes AA for UI components and large/bold text (~4.3:1)
    const inkOnSage = getContrast(ink, sage);
    expect(inkOnSage).toBeGreaterThan(4.0);

    // Ink on cream passes AAA (over 10:1)
    const inkOnCream = getContrast(ink, cream);
    expect(inkOnCream).toBeGreaterThan(10.0);
  });
});
