import { db } from './schema';
import { StashFile } from '../domain/types';
import { hashContent } from '../domain/titleFromContent';

export const filesRepo = {
  async getAll(): Promise<StashFile[]> {
    return await db.files.orderBy('updatedAt').reverse().toArray();
  },

  async getById(id: string): Promise<StashFile | undefined> {
    return await db.files.get(id);
  },

  async getByCollection(collectionId: string | null): Promise<StashFile[]> {
    if (collectionId === null) {
      return await db.files.filter((f) => f.collectionId === null).toArray();
    }
    return await db.files.where('collectionId').equals(collectionId).toArray();
  },

  async getPinned(): Promise<StashFile[]> {
    return await db.files.filter((f) => f.pinned).toArray();
  },

  async create(fileData: Omit<StashFile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<StashFile> {
    const now = Date.now();
    const id = fileData.id || crypto.randomUUID();
    const newFile: StashFile = {
      ...fileData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.files.put(newFile);
    return newFile;
  },

  async update(id: string, updates: Partial<Omit<StashFile, 'id' | 'createdAt'>>): Promise<void> {
    await db.files.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.files, db.versions, async () => {
      await db.files.delete(id);
      await db.versions.where('fileId').equals(id).delete();
    });
  },

  async deleteMany(ids: string[]): Promise<void> {
    await db.transaction('rw', db.files, db.versions, async () => {
      await db.files.bulkDelete(ids);
      for (const id of ids) {
        await db.versions.where('fileId').equals(id).delete();
      }
    });
  },

  async togglePin(id: string): Promise<boolean> {
    const file = await db.files.get(id);
    if (!file) return false;
    const nextPinned = !file.pinned;
    await db.files.update(id, { pinned: nextPinned, updatedAt: Date.now() });
    return nextPinned;
  },

  async moveToCollection(id: string, collectionId: string | null): Promise<void> {
    await db.files.update(id, { collectionId, updatedAt: Date.now() });
  },

  async moveManyToCollection(ids: string[], collectionId: string | null): Promise<void> {
    await db.files.where('id').anyOf(ids).modify({ collectionId, updatedAt: Date.now() });
  },

  async findDuplicate(filename: string, content: string): Promise<StashFile | undefined> {
    const targetHash = hashContent(content);
    const existing = await db.files.where('filename').equals(filename).toArray();
    return existing.find((f) => hashContent(f.content) === targetHash);
  },

  async findByFilename(filename: string): Promise<StashFile | undefined> {
    const matches = await db.files.where('filename').equals(filename).toArray();
    return matches[0];
  },

  async clearAll(): Promise<void> {
    await db.files.clear();
  },
};
