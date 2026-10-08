import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db/schema';
import { filesRepo } from '../../src/db/files.repo';
import { collectionsRepo } from '../../src/db/collections.repo';
import { versionsRepo } from '../../src/db/versions.repo';

describe('Dexie repositories CRUD tests', () => {
  beforeEach(async () => {
    await db.files.clear();
    await db.collections.clear();
    await db.versions.clear();
  });

  it('can create, retrieve, update, and delete collections', async () => {
    const col = await collectionsRepo.create({
      name: 'Prompts',
      color: '#C99AB5',
      icon: 'sparkles',
      order: 0,
    });
    expect(col.id).toBeDefined();

    const retrieved = await collectionsRepo.getById(col.id);
    expect(retrieved?.name).toBe('Prompts');

    await collectionsRepo.update(col.id, { name: 'AI Prompts' });
    const updated = await collectionsRepo.getById(col.id);
    expect(updated?.name).toBe('AI Prompts');

    await collectionsRepo.delete(col.id);
    const afterDelete = await collectionsRepo.getById(col.id);
    expect(afterDelete).toBeUndefined();
  });

  it('can create, retrieve, pin, and delete files', async () => {
    const file = await filesRepo.create({
      title: 'Agent Guide',
      filename: 'AGENTS.md',
      content: '# Multi-agent operations\nRule 1: Always check context.',
      collectionId: null,
      tags: ['agents', 'ai'],
      pinned: false,
      size: 50,
    });

    expect(file.id).toBeDefined();

    const all = await filesRepo.getAll();
    expect(all.length).toBe(1);
    expect(all[0].filename).toBe('AGENTS.md');

    // Toggle pin
    const isPinned = await filesRepo.togglePin(file.id);
    expect(isPinned).toBe(true);

    const pinnedFiles = await filesRepo.getPinned();
    expect(pinnedFiles.length).toBe(1);

    // Delete
    await filesRepo.delete(file.id);
    const afterDelete = await filesRepo.getAll();
    expect(afterDelete.length).toBe(0);
  });

  it('stores and restores versions snapshots', async () => {
    const file = await filesRepo.create({
      title: 'Doc',
      filename: 'doc.md',
      content: 'Original content',
      collectionId: null,
      tags: [],
      pinned: false,
      size: 16,
    });

    const v1 = await versionsRepo.add(file.id, file.content);
    expect(v1.id).toBeDefined();

    const versions = await versionsRepo.getByFileId(file.id);
    expect(versions.length).toBe(1);
    expect(versions[0].content).toBe('Original content');
  });
});
