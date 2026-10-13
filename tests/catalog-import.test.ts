import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Dexie from 'dexie';
import 'fake-indexeddb/auto';
import { db } from '../src/db/schema';
import { catalogImportService, ImportProgress } from '../src/services/catalogImport';
import { ComponentMetadata } from '../src/domain/componentTypes';
import fs from 'fs';
import path from 'path';

describe('Catalog Import Service & Progress Tracking', () => {
  let pilotCatalog: ComponentMetadata[];

  beforeEach(async () => {
    await db.components.clear();
    await db.files.clear();

    const pilotPath = path.join(__dirname, '../public/pilot-catalog.json');
    pilotCatalog = JSON.parse(fs.readFileSync(pilotPath, 'utf8'));

    // Mock global fetch to return pilotCatalog
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(pilotCatalog),
      })
    );
  });

  it('imports catalog in chunks, reports progress accurately, and leaves existing files intact', async () => {
    // 1. Add an existing user note (v1 data)
    await db.files.add({
      id: 'existing-note',
      title: 'My Custom Note',
      filename: 'note.md',
      content: 'Important content',
      collectionId: null,
      tags: ['personal'],
      pinned: false,
      size: 100,
      createdAt: 1000,
      updatedAt: 1000,
    });

    const progressSnapshots: ImportProgress[] = [];
    const unsubscribe = catalogImportService.subscribe((progress) => {
      progressSnapshots.push({ ...progress });
    });

    // 2. Trigger import with small batchSize to verify multi-chunk progress
    await catalogImportService.importCatalogIfNeeded({
      url: '/pilot-catalog.json',
      force: true,
      batchSize: 100,
    });

    unsubscribe();

    // 3. Verify progress snapshots reached 100% and 'ready' status
    expect(progressSnapshots.length).toBeGreaterThan(1);
    const finalProgress = progressSnapshots[progressSnapshots.length - 1];
    expect(finalProgress.status).toBe('ready');
    expect(finalProgress.total).toBe(300);
    expect(finalProgress.imported).toBe(300);
    expect(finalProgress.percentage).toBe(100);

    // 4. Verify all 300 components are now queryable in Dexie
    const importedCount = await db.components.count();
    expect(importedCount).toBe(300);

    const firstItem = await db.components.get(pilotCatalog[0].id);
    expect(firstItem?.name).toBe(pilotCatalog[0].name);

    // 5. Verify existing user note is 100% intact
    const existingFile = await db.files.get('existing-note');
    expect(existingFile?.title).toBe('My Custom Note');
  });
});
