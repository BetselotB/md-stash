import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/db/schema';
import { componentsRepo } from '../src/db/components.repo';
import { ComponentMetadata, CodeBlob } from '../src/domain/componentTypes';
import { iframeLRU, generateSandboxHtml, getPreviewStatusInfo } from '../src/services/previewRuntime';

describe('Gallery and ComponentDetail (Phase 4)', () => {
  const sampleReadyComponent: ComponentMetadata = {
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

  const sampleNeedsDemoComponent: ComponentMetadata = {
    id: 'complex-kanban',
    name: 'Complex Kanban',
    kind: 'block',
    category: 'layout',
    tags: ['kanban', 'dnd'],
    framework: 'react',
    styling: 'tailwind',
    requires: ['@dnd-kit/core'],
    source: 'shadcn',
    previewStatus: 'needs-demo',
    license: 'MIT',
    attribution: 'shadcn/ui (MIT)',
    favorite: false,
    origin: 'harvested',
    description: 'Kanban board requiring state provider wrapper.',
    depsCount: 2,
    createdAt: 1700000000,
    updatedAt: 1700000000,
  };

  const sampleBlob: CodeBlob = {
    id: 'shimmer-button',
    code: `
      import React from 'react';
      import { cn } from '@/lib/utils';
      export interface ShimmerButtonProps {
        shimmerColor?: string;
        children?: React.ReactNode;
      }
      export const ShimmerButton = ({ shimmerColor = '#ffffff', children }: ShimmerButtonProps) => {
        return <button className={cn('relative rounded-xl px-4 py-2')}>{children}</button>;
      };
      export default ShimmerButton;
    `,
    props: [
      { name: 'shimmerColor', type: 'string', default: '#ffffff' },
      { name: 'children', type: 'ReactNode' },
    ],
    deps: ['clsx', 'tailwind-merge'],
    dependsOn: [],
    shared: ['utils/cn'],
  };

  beforeEach(async () => {
    iframeLRU.clear();
    await componentsRepo.clear();
    await componentsRepo.putBatch([sampleReadyComponent, sampleNeedsDemoComponent]);
    await componentsRepo.putCodeBlob(sampleBlob);
  });

  it('stores and retrieves component metadata in Dexie', async () => {
    const all = await componentsRepo.getAll();
    expect(all.length).toBe(2);

    const readyItem = await componentsRepo.getById('shimmer-button');
    expect(readyItem).toBeDefined();
    expect(readyItem?.name).toBe('Shimmer Button');
    expect(readyItem?.previewStatus).toBe('ready');
  });

  it('filters components by category and favorite status', async () => {
    const buttons = await componentsRepo.getByCategory('buttons');
    expect(buttons.length).toBe(1);
    expect(buttons[0].id).toBe('shimmer-button');

    // Toggle favorite
    await componentsRepo.setFavorite('shimmer-button', true);
    const favs = await componentsRepo.getFavorites();
    expect(favs.length).toBe(1);
    expect(favs[0].id).toBe('shimmer-button');
  });

  it('retrieves lazy code blobs with full dependency graph', async () => {
    const codeData = await componentsRepo.getCodeBlob('shimmer-button');
    expect(codeData).toBeDefined();
    expect(codeData?.code).toContain('ShimmerButton');
    expect(codeData?.props.length).toBe(2);
    expect(codeData?.shared).toContain('utils/cn');
  });

  it('generates sandboxed HTML with dynamic import map and neutral tokens', () => {
    const html = generateSandboxHtml(sampleReadyComponent, sampleBlob, {
      theme: 'dark',
      props: { shimmerColor: '#ff9900' },
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('class="dark"');
    expect(html).toContain('cdn.tailwindcss.com');
    expect(html).toContain('--background: 240 10% 3.9%');
    expect(html).toContain('type="importmap"');
    expect(html).toContain('ShimmerButton');
  });

  it('strictly limits active sandbox iframes to 4 via LRU eviction', () => {
    iframeLRU.clear();
    const evictions: string[] = [];

    iframeLRU.requestSlot('card-1', () => evictions.push('card-1'));
    iframeLRU.requestSlot('card-2', () => evictions.push('card-2'));
    iframeLRU.requestSlot('card-3', () => evictions.push('card-3'));
    iframeLRU.requestSlot('card-4', () => evictions.push('card-4'));

    expect(iframeLRU.getActiveCount()).toBe(4);
    expect(evictions.length).toBe(0);

    // 5th card triggers eviction of card-1 (LRU)
    iframeLRU.requestSlot('card-5', () => evictions.push('card-5'));
    expect(iframeLRU.getActiveCount()).toBe(4);
    expect(evictions).toContain('card-1');
    expect(iframeLRU.isSlotActive('card-1')).toBe(false);
    expect(iframeLRU.isSlotActive('card-5')).toBe(true);

    iframeLRU.clear();
  });

  it('provides honest status info for needs-demo, primitive, and unsupported', () => {
    const readyInfo = getPreviewStatusInfo('ready');
    expect(readyInfo.label).toBe('Ready');

    const needsDemoInfo = getPreviewStatusInfo('needs-demo');
    expect(needsDemoInfo.label).toBe('Needs Demo');
    expect(needsDemoInfo.promptAction).toContain('AI');

    const primInfo = getPreviewStatusInfo('primitive');
    expect(primInfo.label).toBe('Primitive');

    const unsupInfo = getPreviewStatusInfo('unsupported');
    expect(unsupInfo.label).toBe('Unsupported');
  });
});
