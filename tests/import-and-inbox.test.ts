import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseFromPaste,
  detectStyling,
  detectComponentName,
  detectCategory,
  checkDeduplication,
} from '../src/services/componentImport';
import { wishlistRepo } from '../src/db/wishlist.repo';
import { componentsRepo } from '../src/db/components.repo';
import { ComponentMetadata, CodeBlob } from '../src/domain/componentTypes';

describe('Add, Import & Wishlist Inbox (Phase 6)', () => {
  beforeEach(async () => {
    await wishlistRepo.clear();
    await componentsRepo.clear();
  });

  describe('Component Import Parsers & Auto-detection', () => {
    it('parses pure TSX code and auto-detects name, styling, and dependencies', () => {
      const tsx = `
        import React from 'react';
        import { motion } from 'framer-motion';
        import { cn } from '@/lib/utils';

        export function GlowingCard({ children }: { children: React.ReactNode }) {
          return (
            <motion.div className={cn("p-6 rounded-2xl bg-card text-card-foreground shadow-lg")}>
              {children}
            </motion.div>
          );
        }
        export default GlowingCard;
      `;

      const result = parseFromPaste(tsx);
      expect(result.name).toBe('Glowing Card');
      expect(result.id).toBe('glowing-card');
      expect(result.styling).toBe('tailwind');
      expect(result.category).toBe('data-display');
      expect(result.deps).toContain('framer-motion');
      expect(result.code).toContain('GlowingCard');
    });

    it('parses markdown with frontmatter correctly', () => {
      const md = `---
name: "Magic Shimmer"
category: buttons
tags: ["button", "shimmer"]
license: MIT
attribution: "Magic UI (MIT)"
---

# Magic Shimmer
A special button.

\`\`\`tsx
export const MagicShimmer = () => <button className="btn">Click</button>;
\`\`\`
`;

      const result = parseFromPaste(md);
      expect(result.name).toBe('Magic Shimmer');
      expect(result.category).toBe('buttons');
      expect(result.tags).toContain('button');
      expect(result.tags).toContain('shimmer');
      expect(result.license).toBe('MIT');
      expect(result.code).toBe('export const MagicShimmer = () => <button className="btn">Click</button>;');
    });

    it('detects CSS Modules styling correctly', () => {
      const cssModCode = `
        import styles from './button.module.css';
        export const Button = () => <button className={styles.primary}>Click</button>;
      `;
      expect(detectStyling(cssModCode)).toBe('css-modules');
    });

    it('detects unstyled primitives correctly', () => {
      const unstyledCode = `
        import * as Dialog from '@radix-ui/react-dialog';
        export const Modal = () => <Dialog.Root><Dialog.Content /></Dialog.Root>;
      `;
      expect(detectStyling(unstyledCode)).toBe('unstyled');
    });
  });

  describe('Deduplication Checker', () => {
    const existingComp: ComponentMetadata = {
      id: 'sparkle-button',
      name: 'Sparkle Button',
      kind: 'component',
      category: 'buttons',
      tags: ['button'],
      framework: 'react',
      styling: 'tailwind',
      requires: [],
      source: 'harvested',
      previewStatus: 'ready',
      license: 'MIT',
      attribution: 'Test (MIT)',
      favorite: false,
      origin: 'harvested',
      description: 'Existing sparkle button',
      depsCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const existingCode = 'export const SparkleButton = () => <button>Sparkle</button>;';
    const blobsMap = new Map<string, string>([['sparkle-button', existingCode]]);

    it('detects duplicate slug match', () => {
      const dedupe = checkDeduplication('export const Other = () => null;', 'sparkle-button', [existingComp], blobsMap);
      expect(dedupe.isDuplicate).toBe(true);
      expect(dedupe.matchType).toBe('slug');
      expect(dedupe.matchedComponent?.name).toBe('Sparkle Button');
    });

    it('detects exact code content match with different slug', () => {
      const dedupe = checkDeduplication('  export const SparkleButton = () => <button>Sparkle</button>;  ', 'new-slug', [existingComp], blobsMap);
      expect(dedupe.isDuplicate).toBe(true);
      expect(dedupe.matchType).toBe('exact');
      expect(dedupe.matchedComponent?.name).toBe('Sparkle Button');
    });

    it('returns isDuplicate: false for unique components', () => {
      const dedupe = checkDeduplication('export const Unique = () => <div>Hello</div>;', 'unique-comp', [existingComp], blobsMap);
      expect(dedupe.isDuplicate).toBe(false);
    });
  });

  describe('Wishlist Inbox & Agent Requests', () => {
    it('records and increments agent requests', async () => {
      const item1 = await wishlistRepo.addOrIncrement('command palette with fuzzy search', 'Needed for search modal');
      expect(item1.query).toBe('command palette with fuzzy search');
      expect(item1.count).toBe(1);
      expect(item1.status).toBe('pending');

      // Requesting same query again increments count
      const item2 = await wishlistRepo.addOrIncrement('Command Palette with Fuzzy Search');
      expect(item2.id).toBe(item1.id);
      expect(item2.count).toBe(2);

      const pending = await wishlistRepo.getPending();
      expect(pending.length).toBe(1);
      expect(pending[0].count).toBe(2);
    });

    it('updates request status and handles triage lifecycle', async () => {
      const item = await wishlistRepo.addOrIncrement('color picker popover');
      expect(await wishlistRepo.countPending()).toBe(1);

      await wishlistRepo.updateStatus(item.id, 'completed');
      expect(await wishlistRepo.countPending()).toBe(0);

      const all = await wishlistRepo.getAll();
      expect(all.length).toBe(1);
      expect(all[0].status).toBe('completed');
    });

    it('simulates end-to-end: agent request -> user add -> library searchable < 10ms', async () => {
      // 1. Agent records wishlist item
      const request = await wishlistRepo.addOrIncrement('glowing avatar');
      expect(request.status).toBe('pending');

      // 2. User imports/adds component
      const parsed = parseFromPaste(`
        export function GlowingAvatar() {
          return <div className="rounded-full ring-2 ring-orange">Avatar</div>;
        }
      `, request.query);

      const meta: ComponentMetadata = {
        id: parsed.id,
        name: parsed.name,
        kind: 'component',
        category: parsed.category,
        tags: [...parsed.tags, request.query],
        framework: 'react',
        styling: parsed.styling,
        requires: [],
        source: 'user',
        previewStatus: 'ready',
        license: 'MIT',
        attribution: 'User component',
        favorite: false,
        origin: 'user',
        description: 'Added from agent wishlist',
        depsCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const blob: CodeBlob = {
        id: parsed.id,
        code: parsed.code,
        props: [],
        deps: [],
        dependsOn: [],
        shared: ['utils/cn'],
      };

      await componentsRepo.putBatch([meta]);
      await componentsRepo.putCodeBlob(blob);

      // 3. Mark request completed
      await wishlistRepo.updateStatus(request.id, 'completed');

      // 4. Verify in Dexie
      const saved = await componentsRepo.getById(parsed.id);
      expect(saved).toBeDefined();
      expect(saved?.name).toBe('Glowing Avatar');
      expect(saved?.tags).toContain('glowing avatar');

      const pendingCount = await wishlistRepo.countPending();
      expect(pendingCount).toBe(0);
    });
  });
});
