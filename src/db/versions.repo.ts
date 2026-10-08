import { db } from './schema';
import { Version } from '../domain/types';

export const versionsRepo = {
  async getByFileId(fileId: string): Promise<Version[]> {
    return await db.versions
      .where('fileId')
      .equals(fileId)
      .reverse()
      .sortBy('createdAt');
  },

  async add(fileId: string, content: string, maxPerFile = 25): Promise<Version> {
    const version: Version = {
      id: crypto.randomUUID(),
      fileId,
      content,
      createdAt: Date.now(),
    };
    await db.versions.put(version);

    // Prune older versions if count exceeds maxPerFile
    const all = await db.versions
      .where('fileId')
      .equals(fileId)
      .sortBy('createdAt');

    if (all.length > maxPerFile) {
      const toRemove = all.slice(0, all.length - maxPerFile);
      const idsToRemove = toRemove.map((v) => v.id);
      await db.versions.bulkDelete(idsToRemove);
    }

    return version;
  },

  async deleteByFileId(fileId: string): Promise<void> {
    await db.versions.where('fileId').equals(fileId).delete();
  },

  async clearAll(): Promise<void> {
    await db.versions.clear();
  },
};
