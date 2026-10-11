import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db/schema';
import { filesRepo } from '../../src/db/files.repo';
import { collectionsRepo } from '../../src/db/collections.repo';
import {
  importFilesList,
  getTargetCollectionFromRoute,
  getRouteCollectionId,
} from '../../src/services/fileImport';
import { importExportService } from '../../src/services/importExport';

describe('fileImport collection routing and deduplication tests', () => {
  beforeEach(async () => {
    await db.files.clear();
    await db.collections.clear();
    window.history.pushState({}, '', '/app');
  });

  it('resolves target collection correctly from explicit id, route, deleted collection, and unsorted', async () => {
    const col1 = await collectionsRepo.create({
      name: 'AI Context',
      color: '#7D9671',
      icon: 'folder',
      order: 0,
    });

    // Explicit valid collection id
    const resExplicit = await getTargetCollectionFromRoute(col1.id);
    expect(resExplicit.collectionId).toBe(col1.id);
    expect(resExplicit.collectionName).toBe('AI Context');

    // Deleted collection id falls back to Unsorted (null)
    const resDeleted = await getTargetCollectionFromRoute('deleted-id-12345');
    expect(resDeleted.collectionId).toBeNull();
    expect(resDeleted.collectionName).toBeNull();

    // Explicit unsorted
    const resUnsorted = await getTargetCollectionFromRoute('unsorted');
    expect(resUnsorted.collectionId).toBeNull();
    expect(resUnsorted.collectionName).toBeNull();

    // Derived from router on collection view
    window.history.pushState({}, '', `/app/c/${col1.id}`);
    expect(getRouteCollectionId()).toBe(col1.id);
    const resRoute = await getTargetCollectionFromRoute();
    expect(resRoute.collectionId).toBe(col1.id);
    expect(resRoute.collectionName).toBe('AI Context');

    // Derived from router on deleted collection view
    window.history.pushState({}, '', '/app/c/non-existent-collection');
    const resRouteDeleted = await getTargetCollectionFromRoute();
    expect(resRouteDeleted.collectionId).toBeNull();
    expect(resRouteDeleted.collectionName).toBeNull();

    // Derived from router on /app (All files)
    window.history.pushState({}, '', '/app');
    const resAll = await getTargetCollectionFromRoute();
    expect(resAll.collectionId).toBeNull();
  });

  it('imports files into active collection and formats success toast message', async () => {
    const col1 = await collectionsRepo.create({
      name: 'AI Context',
      color: '#7D9671',
      icon: 'folder',
      order: 0,
    });

    window.history.pushState({}, '', `/app/c/${col1.id}`);

    const file = new File(['# AI Rules\nAlways be helpful.'], 'ai-rules.md', {
      type: 'text/markdown',
    });

    const result = await importFilesList([file]);
    expect(result.added).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.collectionId).toBe(col1.id);
    expect(result.collectionName).toBe('AI Context');
    expect(result.message).toBe('1 file added to AI Context');

    const saved = await filesRepo.findByFilename('ai-rules.md');
    expect(saved).toBeDefined();
    expect(saved?.collectionId).toBe(col1.id);

    // Duplicate skipping
    const duplicateFile = new File(['# AI Rules\nAlways be helpful.'], 'ai-rules.md', {
      type: 'text/markdown',
    });
    const dupResult = await importFilesList([duplicateFile]);
    expect(dupResult.added).toBe(0);
    expect(dupResult.skipped).toBe(1);
    expect(dupResult.message).toBe('0 files added (1 skipped)');
  });

  it('falls back to Unsorted when importing from /app or with non-existent collection', async () => {
    window.history.pushState({}, '', '/app');

    const file = new File(['# General doc'], 'general.md', {
      type: 'text/markdown',
    });

    const result = await importFilesList([file]);
    expect(result.added).toBe(1);
    expect(result.collectionId).toBeNull();
    expect(result.message).toBe('1 file added to stash');

    const saved = await filesRepo.findByFilename('general.md');
    expect(saved?.collectionId).toBeNull();
  });

  it('keeps internal collections when importing zip archives', async () => {
    const colZip = await collectionsRepo.create({
      name: 'Zip Inner Col',
      color: '#E06D53',
      icon: 'folder',
      order: 0,
    });

    const testFile = await filesRepo.create({
      title: 'Zipped File',
      filename: 'zipped.md',
      content: '# Zipped file content',
      collectionId: colZip.id,
      tags: ['archive'],
      pinned: false,
      size: 21,
    });

    const zipBuffer = importExportService.createZipBuffer([testFile], [colZip]);

    // Clear db
    await filesRepo.clearAll();
    await collectionsRepo.clearAll();

    // Now set active route to another collection
    const activeCol = await collectionsRepo.create({
      name: 'Active Route Col',
      color: '#7D9671',
      icon: 'folder',
      order: 0,
    });
    window.history.pushState({}, '', `/app/c/${activeCol.id}`);

    const zipBlob = new Blob([zipBuffer as any], { type: 'application/zip' });
    const zipFile = new File([zipBlob], 'backup.zip', { type: 'application/zip' });

    const result = await importFilesList([zipFile]);
    expect(result.added).toBe(1);

    // The file should have its original collection id from the zip, NOT activeCol.id
    const restored = await filesRepo.findByFilename('zipped.md');
    expect(restored).toBeDefined();
    expect(restored?.collectionId).toBe(colZip.id);
    expect(restored?.collectionId).not.toBe(activeCol.id);
  });
});
