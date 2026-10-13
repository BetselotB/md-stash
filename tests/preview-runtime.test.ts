import { describe, it, expect, vi } from 'vitest';
import {
  transpileToJs,
  extractImportSpecifiers,
  buildImportMap,
  synthesizeDefaultProps,
  generateSandboxHtml,
  getPreviewStatusInfo,
  iframeLRU,
} from '../src/services/previewRuntime';
import { ComponentMetadata, CodeBlob } from '../src/domain/componentTypes';

describe('Preview Runtime Service', () => {
  it('transpiles TSX with types and JSX to clean JS using Sucrase', () => {
    const tsxCode = `
      interface Props {
        label: string;
        count?: number;
      }
      export const Button = ({ label, count = 0 }: Props) => {
        return <button className="btn">{label} ({count})</button>;
      };
      export default Button;
    `;

    const js = transpileToJs(tsxCode);
    expect(js).toContain('React.createElement');
    expect(js).not.toContain('interface Props');
    expect(js).toContain('export const Button');
  });

  it('extracts external npm dependencies from import statements', () => {
    const code = `
      import React, { useState } from 'react';
      import { motion } from 'framer-motion';
      import { Sparkles } from 'lucide-react';
      import { cn } from '@/lib/utils';
      import { SubItem } from './sub-item';
    `;

    const specifiers = extractImportSpecifiers(code);
    expect(specifiers).toContain('react');
    expect(specifiers).toContain('framer-motion');
    expect(specifiers).toContain('lucide-react');
    expect(specifiers).not.toContain('@/lib/utils');
    expect(specifiers).not.toContain('./sub-item');
  });

  it('builds browser import map with pinned esm.sh CDN URLs and utils/cn data URL', () => {
    const map = buildImportMap(['canvas-confetti']);
    expect(map['react']).toContain('https://esm.sh/react@18.3.1');
    expect(map['react-dom']).toContain('https://esm.sh/react-dom@18.3.1');
    expect(map['@/lib/utils']).toMatch(/^data:text\/javascript/);
    expect(map['canvas-confetti']).toContain('https://esm.sh/canvas-confetti');
  });

  it('synthesizes sensible default props from Prop[] definitions', () => {
    const props = [
      { name: 'title', type: 'string', required: true },
      { name: 'active', type: 'boolean', default: 'true' },
      { name: 'count', type: 'number', default: '42' },
      { name: 'items', type: 'string[]' },
    ];

    const defaults = synthesizeDefaultProps(props);
    expect(defaults.title).toBe('Title');
    expect(defaults.active).toBe(true);
    expect(defaults.count).toBe(42);
    expect(Array.isArray(defaults.items)).toBe(true);
  });

  it('generates sandboxed HTML with neutral tokens, Tailwind and entry script', () => {
    const meta: ComponentMetadata = {
      id: 'shimmer-button',
      name: 'Shimmer Button',
      kind: 'component',
      category: 'buttons',
      tags: ['button', 'shimmer'],
      framework: 'react',
      styling: 'tailwind',
      requires: [],
      source: 'magic-ui',
      previewStatus: 'ready',
      license: 'MIT',
      attribution: 'Magic UI (MIT)',
      favorite: false,
      origin: 'harvested',
      description: 'Shimmering button',
      depsCount: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const blob: CodeBlob = {
      id: 'shimmer-button',
      code: 'export default function ShimmerButton({ children }: any) { return <button>{children}</button>; }',
      props: [{ name: 'children', type: 'ReactNode' }],
      deps: [],
      dependsOn: [],
      shared: ['utils/cn'],
    };

    const html = generateSandboxHtml(meta, blob, { theme: 'dark' });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en" class="dark">');
    expect(html).toContain('cdn.tailwindcss.com');
    expect(html).toContain('--background: 240 10% 3.9%');
    expect(html).toContain('type="importmap"');
    expect(html).toContain('PREVIEW_READY');
  });

  it('enforces 4-iframe LRU cap and calls onEvict on the oldest slot', () => {
    iframeLRU.clear();

    const evict1 = vi.fn();
    const evict2 = vi.fn();
    const evict3 = vi.fn();
    const evict4 = vi.fn();
    const evict5 = vi.fn();

    iframeLRU.requestSlot('slot-1', evict1);
    iframeLRU.requestSlot('slot-2', evict2);
    iframeLRU.requestSlot('slot-3', evict3);
    iframeLRU.requestSlot('slot-4', evict4);

    expect(iframeLRU.getActiveCount()).toBe(4);
    expect(evict1).not.toHaveBeenCalled();

    // Requesting a 5th slot must evict slot-1 (oldest)
    iframeLRU.requestSlot('slot-5', evict5);

    expect(iframeLRU.getActiveCount()).toBe(4);
    expect(evict1).toHaveBeenCalledTimes(1);
    expect(iframeLRU.isSlotActive('slot-1')).toBe(false);
    expect(iframeLRU.isSlotActive('slot-5')).toBe(true);

    iframeLRU.clear();
  });

  it('returns honest badge info and descriptions for all preview statuses', () => {
    expect(getPreviewStatusInfo('ready').label).toBe('Ready');
    expect(getPreviewStatusInfo('needs-demo').label).toBe('Needs Demo');
    expect(getPreviewStatusInfo('needs-demo').promptAction).toBeDefined();
    expect(getPreviewStatusInfo('primitive').label).toBe('Primitive');
    expect(getPreviewStatusInfo('unsupported').label).toBe('Unsupported');
  });
});
