import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db/schema';
import { filesRepo } from '../../src/db/files.repo';
import { collectionsRepo } from '../../src/db/collections.repo';
import { importExportService } from '../../src/services/importExport';
import { StashFile, Collection } from '../../src/domain/types';

describe('Zip export & import round-trip tests', () => {
  beforeEach(async () => {
    await db.files.clear();
    await db.collections.clear();
  });

  it('exports library to zip buffer and restores all collections, files, tags, and pins', async () => {
    // 1. Create original collection and files
    const col = await collectionsRepo.create({
      name: 'Agent Guidelines',
      color: '#F2A33A',
      icon: 'sparkles',
      order: 0,
    });

    const file1 = await filesRepo.create({
      title: 'Claude Rules',
      filename: 'CLAUDE.md',
      content: '# Claude instructions\nBe concise and clear.',
      collectionId: col.id,
      tags: ['claude', 'rules'],
      pinned: true,
      size: 45,
    });

    const file2 = await filesRepo.create({
      title: 'Notes',
      filename: 'notes.md',
      content: '# Daily notes\nKeep everything local.',
      collectionId: null, // Unsorted
      tags: ['personal'],
      pinned: false,
      size: 35,
    });

    const originalFiles = await filesRepo.getAll();
    const originalCols = await collectionsRepo.getAll();

    expect(originalFiles.length).toBe(2);
    expect(originalCols.length).toBe(1);

    // 2. Export to zip buffer
    const zipBuffer = importExportService.createZipBuffer(originalFiles, originalCols);
    expect(zipBuffer.length).toBeGreaterThan(0);

    // 3. Wipe database completely
    await filesRepo.clearAll();
    await collectionsRepo.clearAll();

    const wipedFiles = await filesRepo.getAll();
    const wipedCols = await collectionsRepo.getAll();
    expect(wipedFiles.length).toBe(0);
    expect(wipedCols.length).toBe(0);

    // 4. Import from zip buffer
    const result = await importExportService.importZipBuffer(zipBuffer);
    expect(result.filesCount).toBe(2);
    expect(result.collectionsCount).toBe(1);

    // 5. Verify restored state
    const restoredCols = await collectionsRepo.getAll();
    expect(restoredCols.length).toBe(1);
    expect(restoredCols[0].id).toBe(col.id);
    expect(restoredCols[0].name).toBe('Agent Guidelines');
    expect(restoredCols[0].color).toBe('#F2A33A');

    const restoredFiles = await filesRepo.getAll();
    expect(restoredFiles.length).toBe(2);

    const restoredClaude = restoredFiles.find((f) => f.filename === 'CLAUDE.md');
    expect(restoredClaude).toBeDefined();
    expect(restoredClaude?.title).toBe('Claude Rules');
    expect(restoredClaude?.content).toBe('# Claude instructions\nBe concise and clear.');
    expect(restoredClaude?.collectionId).toBe(col.id);
    expect(restoredClaude?.pinned).toBe(true);
    expect(restoredClaude?.tags).toContain('claude');

    const restoredNotes = restoredFiles.find((f) => f.filename === 'notes.md');
    expect(restoredNotes).toBeDefined();
    expect(restoredNotes?.collectionId).toBeNull();
    expect(restoredNotes?.pinned).toBe(false);
    expect(restoredNotes?.tags).toContain('personal');
  });
});
