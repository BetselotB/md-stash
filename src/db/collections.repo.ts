import { db } from './schema';
import { Collection } from '../domain/types';
import { cloudSync } from '../services/cloudSync';

export const collectionsRepo = {
  async getAll(): Promise<Collection[]> {
    return await db.collections.orderBy('order').toArray();
  },

  async getById(id: string): Promise<Collection | undefined> {
    return await db.collections.get(id);
  },

  async create(data: Omit<Collection, 'id' | 'createdAt'> & { id?: string }): Promise<Collection> {
    const id = data.id || crypto.randomUUID();
    const count = await db.collections.count();
    const newCollection: Collection = {
      ...data,
      id,
      order: data.order ?? count,
      createdAt: Date.now(),
    };
    await db.collections.put(newCollection);
    cloudSync.pushCollection(newCollection).catch(console.error);
    return newCollection;
  },

  async update(id: string, updates: Partial<Omit<Collection, 'id' | 'createdAt'>>): Promise<void> {
    await db.collections.update(id, updates);
    cloudSync.pushCollectionUpdate(id, updates).catch(console.error);
  },

  async delete(id: string, moveFilesToUnsorted = true): Promise<void> {
    await db.transaction('rw', db.collections, db.files, async () => {
      await db.collections.delete(id);
      if (moveFilesToUnsorted) {
        await db.files.where('collectionId').equals(id).modify({ collectionId: null });
      } else {
        await db.files.where('collectionId').equals(id).delete();
      }
    });
    cloudSync.removeCollection(id).catch(console.error);
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await db.transaction('rw', db.collections, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.collections.update(orderedIds[i], { order: i });
      }
    });
    cloudSync.pushCollectionsReorder(orderedIds).catch(console.error);
  },

  async clearAll(): Promise<void> {
    await db.collections.clear();
  },
};
