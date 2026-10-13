import { db } from './schema';
import { ComponentMetadata, CodeBlob } from '../domain/componentTypes';

export const componentsRepo = {
  async getAll(): Promise<ComponentMetadata[]> {
    return await db.components.orderBy('name').toArray();
  },

  async getById(id: string): Promise<ComponentMetadata | undefined> {
    return await db.components.get(id);
  },

  async getFavorites(): Promise<ComponentMetadata[]> {
    return await db.components.filter((c) => c.favorite).toArray();
  },

  async getByCategory(category: string): Promise<ComponentMetadata[]> {
    return await db.components.where('category').equals(category).toArray();
  },

  async getBySource(source: string): Promise<ComponentMetadata[]> {
    return await db.components.where('source').equals(source).toArray();
  },

  async getByKind(kind: string): Promise<ComponentMetadata[]> {
    return await db.components.where('kind').equals(kind).toArray();
  },

  async setFavorite(id: string, favorite: boolean): Promise<void> {
    await db.components.update(id, { favorite, updatedAt: Date.now() });
  },

  async putBatch(items: ComponentMetadata[]): Promise<void> {
    await db.components.bulkPut(items);
  },

  async count(): Promise<number> {
    return await db.components.count();
  },

  async getCodeBlob(id: string): Promise<CodeBlob | undefined> {
    return await db.codeBlobs.get(id);
  },

  async putCodeBlob(blob: CodeBlob): Promise<void> {
    await db.codeBlobs.put(blob);
  },

  async putCodeBlobsBatch(blobs: CodeBlob[]): Promise<void> {
    await db.codeBlobs.bulkPut(blobs);
  },

  async clear(): Promise<void> {
    await db.components.clear();
    await db.codeBlobs.clear();
  },
};
