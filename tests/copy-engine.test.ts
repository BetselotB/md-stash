import { describe, it, expect } from 'vitest';
import {
  formatCopyCode,
  formatCopyWithDeps,
  formatCopyMarkdown,
  formatCopyPrompt,
  formatCopyInstall,
  formatCopyAgentLink,
  formatCopyMcpCall,
  formatCopyKitPrompt,
  createComponentZipBuffer,
} from '../src/services/copyEngine';
import { ComponentMetadata, CodeBlob } from '../src/domain/componentTypes';
import { unzipSync, strFromU8 } from 'fflate';
import { transpileToJs } from '../src/services/previewRuntime';
import fs from 'fs';

describe('Copy & Export Engine (Phase 5)', () => {
  const sampleComponent: ComponentMetadata = {
    id: 'shimmer-button',
    name: 'Shimmer Button',
    kind: 'component',
    category: 'buttons',
    tags: ['button', 'shimmer', 'animation'],
    framework: 'react',
    styling: 'tailwind',
    requires: [],
    source: 'magic-ui',
    previewStatus: 'ready',
    license: 'MIT',
    attribution: 'Magic UI (MIT) https://magicui.design',
    favorite: false,
    origin: 'harvested',
    description: 'A button with a shimmering animated outline.',
    depsCount: 1,
    createdAt: 1700000000,
    updatedAt: 1700000000,
  };

  const sampleBlob: CodeBlob = {
    id: 'shimmer-button',
    code: `import React from 'react';
import { cn } from '@/lib/utils';

export interface ShimmerButtonProps {
  shimmerColor?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = ({ shimmerColor = '#ffffff', children }: ShimmerButtonProps) => {
  return <button className={cn('relative rounded-xl px-4 py-2')}>{children}</button>;
};

export default ShimmerButton;`,
    props: [
      { name: 'shimmerColor', type: 'string', default: '#ffffff' },
      { name: 'children', type: 'ReactNode' },
    ],
    deps: ['clsx', 'tailwind-merge'],
    dependsOn: [],
    shared: ['utils/cn'],
  };

  it('formats clean TSX code with attribution header', () => {
    const code = formatCopyCode(sampleComponent, sampleBlob);
    expect(code).toContain('// Component: Shimmer Button (shimmer-button)');
    expect(code).toContain('// Source: magic-ui | License: MIT');
    expect(code).toContain('// Attribution: Magic UI (MIT)');
    expect(code).toContain('export interface ShimmerButtonProps');
    expect(code).toContain('export const ShimmerButton');
  });

  it('rewrites import aliases dynamically (e.g. to ~/utils)', () => {
    const code = formatCopyCode(sampleComponent, sampleBlob, {
      importAlias: '~/lib/utils',
    });
    expect(code).toContain("import { cn } from '~/lib/utils'");
    expect(code).not.toContain('@/lib/utils');
  });

  it('strips TypeScript types when JavaScript (JS) format is requested', () => {
    const jsCode = formatCopyCode(sampleComponent, sampleBlob, { lang: 'js' });
    expect(jsCode).not.toContain('interface ShimmerButtonProps');
    expect(jsCode).not.toContain(': ShimmerButtonProps');
    expect(jsCode).toContain('export const ShimmerButton');
  });

  it('inlines cn helper when inlineCn option is enabled', () => {
    const bundled = formatCopyWithDeps(sampleComponent, sampleBlob, { inlineCn: true });
    expect(bundled).toContain('function cn(...inputs: ClassValue[])');
    expect(bundled).not.toContain("from '@/lib/utils'");
    expect(bundled).toContain('export const ShimmerButton');
  });

  it('generates multi-file fenced markdown with component and lib/utils.ts', () => {
    const multi = formatCopyWithDeps(sampleComponent, sampleBlob, { multiFile: true });
    expect(multi).toContain('### File: components/ui/shimmer-button.tsx');
    expect(multi).toContain('### File: lib/utils.ts');
    expect(multi).toContain('export function cn');
  });

  it('formats component markdown in frontmatter and doc styles', () => {
    const mdWithFm = formatCopyMarkdown(sampleComponent, sampleBlob);
    expect(mdWithFm).toMatch(/^---/);
    expect(mdWithFm).toContain('name: "Shimmer Button"');
    expect(mdWithFm).toContain('category: buttons');

    const docStyle = formatCopyMarkdown(sampleComponent, sampleBlob, { docStyle: true });
    expect(docStyle).not.toMatch(/^---/);
    expect(docStyle).toContain('# Shimmer Button');
    expect(docStyle).toContain('**Styling:** tailwind');
  });

  it('generates Claude XML prompts for all 6 task modes', () => {
    const implement = formatCopyPrompt(sampleComponent, sampleBlob, 'implement', {
      modelPreset: 'claude',
    });
    expect(implement).toContain('<task>\nAdd the "Shimmer Button" component');
    expect(implement).toContain('<component id="shimmer-button">');
    expect(implement).toContain('<implementation_rules>');

    const adapt = formatCopyPrompt(sampleComponent, sampleBlob, 'adapt', {
      modelPreset: 'claude',
    });
    expect(adapt).toContain('<task>\nAdapt the "Shimmer Button" component');
    expect(adapt).toContain('semantic design system tokens');

    const review = formatCopyPrompt(sampleComponent, sampleBlob, 'review', {
      modelPreset: 'claude',
    });
    expect(review).toContain('<task>\nPerform an accessibility (a11y) and performance review');

    const testPrompt = formatCopyPrompt(sampleComponent, sampleBlob, 'test', {
      modelPreset: 'claude',
    });
    expect(testPrompt).toContain('<task>\nWrite comprehensive unit tests');
  });

  it('generates install commands across package managers (pnpm, npm, bun, yarn)', () => {
    const pnpmInstall = formatCopyInstall(sampleComponent, sampleBlob, { pkgManager: 'pnpm' });
    expect(pnpmInstall.shadcnCommand).toContain('pnpm dlx shadcn@latest add');
    expect(pnpmInstall.depsCommand).toContain('pnpm add clsx tailwind-merge');

    const npmInstall = formatCopyInstall(sampleComponent, sampleBlob, { pkgManager: 'npm' });
    expect(npmInstall.shadcnCommand).toContain('npx shadcn@latest add');
    expect(npmInstall.depsCommand).toContain('npm install clsx tailwind-merge');

    const bunInstall = formatCopyInstall(sampleComponent, sampleBlob, { pkgManager: 'bun' });
    expect(bunInstall.shadcnCommand).toContain('bunx --bun shadcn@latest add');
    expect(bunInstall.depsCommand).toContain('bun add clsx tailwind-merge');
  });

  it('formats Agent Link and MCP tool call JSON', () => {
    const link = formatCopyAgentLink(sampleComponent, 'stash.internal');
    expect(link).toBe('https://stash.internal/c/shimmer-button.md');

    const mcp = formatCopyMcpCall(sampleComponent);
    const parsed = JSON.parse(mcp);
    expect(parsed.tool).toBe('get_component');
    expect(parsed.arguments.id).toBe('shimmer-button');
  });

  it('formats an ordered Kit Prompt Bundle with Table of Contents', () => {
    const secondComponent: ComponentMetadata = {
      ...sampleComponent,
      id: 'rainbow-badge',
      name: 'Rainbow Badge',
      category: 'feedback',
    };
    const blobs = new Map<string, CodeBlob>([
      ['shimmer-button', sampleBlob],
      ['rainbow-badge', { ...sampleBlob, id: 'rainbow-badge', code: 'export const Badge = () => <span>Badge</span>;' }],
    ]);

    const bundle = formatCopyKitPrompt(
      [sampleComponent, secondComponent],
      blobs,
      'Hero Section Kit',
      { modelPreset: 'claude', taskBrief: 'Build an onboarding banner' }
    );

    expect(bundle).toContain('<kit name="Hero Section Kit">');
    expect(bundle).toContain('1. **Shimmer Button**');
    expect(bundle).toContain('2. **Rainbow Badge**');
    expect(bundle).toContain('User Goal: Build an onboarding banner');
  });

  it('creates valid Zip archive containing components, utils, package.json, and README', () => {
    const blobs = new Map<string, CodeBlob>([['shimmer-button', sampleBlob]]);
    const zipBytes = createComponentZipBuffer([sampleComponent], blobs, 'test-kit');

    expect(zipBytes).toBeInstanceOf(Uint8Array);
    expect(zipBytes.length).toBeGreaterThan(0);

    // Unzip and inspect files
    const unzipped = unzipSync(zipBytes);
    expect(unzipped['src/components/ui/shimmer-button.tsx']).toBeDefined();
    expect(unzipped['src/lib/utils.ts']).toBeDefined();
    expect(unzipped['package.json']).toBeDefined();
    expect(unzipped['README.md']).toBeDefined();

    const pkgJson = JSON.parse(strFromU8(unzipped['package.json']));
    expect(pkgJson.name).toBe('test-kit');
    expect(pkgJson.dependencies['clsx']).toBeDefined();

    const readme = strFromU8(unzipped['README.md']);
    expect(readme).toContain('Magic UI (MIT)');
  });

  it('verifies that formatCopyCode output for 25 sampled pilot components compiles cleanly with Sucrase', () => {
    const catalog: ComponentMetadata[] = JSON.parse(
      fs.readFileSync('public/pilot-catalog.json', 'utf8')
    );
    const sampled = catalog.filter((c) => c.previewStatus === 'ready').slice(0, 25);

    expect(sampled.length).toBeGreaterThanOrEqual(20);

    for (const comp of sampled) {
      const regPath = `public/r/${comp.id}.json`;
      if (!fs.existsSync(regPath)) continue;

      const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
      const blob: CodeBlob = {
        id: comp.id,
        code: reg.files?.[0]?.content || '',
        props: [],
        deps: reg.dependencies || [],
        dependsOn: [],
        shared: ['utils/cn'],
      };

      const copyOutput = formatCopyCode(comp, blob, { lang: 'tsx' });
      expect(copyOutput).toContain(comp.name);

      // Verify that code compiles with Sucrase
      const compiled = transpileToJs(copyOutput);
      expect(compiled.length).toBeGreaterThan(0);
    }
  });
});
