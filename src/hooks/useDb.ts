import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { StashFile, Collection, Version } from '../domain/types';
import { ComponentMetadata } from '../domain/componentTypes';

export function useFiles(collectionId?: string | null) {
  return useLiveQuery(
    async () => {
      if (collectionId === undefined) {
        return await db.files.orderBy('updatedAt').reverse().toArray();
      }
      if (collectionId === null) {
        return await db.files.filter((f) => f.collectionId === null).reverse().sortBy('updatedAt');
      }
      return await db.files.where('collectionId').equals(collectionId).reverse().sortBy('updatedAt');
    },
    [collectionId],
    [] as StashFile[]
  );
}

export function usePinnedFiles() {
  return useLiveQuery(
    async () => {
      return await db.files.filter((f) => f.pinned).reverse().sortBy('updatedAt');
    },
    [],
    [] as StashFile[]
  );
}

export function useFile(fileId?: string) {
  return useLiveQuery(
    async () => {
      if (!fileId) return undefined;
      return await db.files.get(fileId);
    },
    [fileId],
    undefined as StashFile | undefined
  );
}

export function useCollections() {
  return useLiveQuery(
    async () => {
      return await db.collections.orderBy('order').toArray();
    },
    [],
    [] as Collection[]
  );
}

export function useCollection(collectionId?: string) {
  return useLiveQuery(
    async () => {
      if (!collectionId) return undefined;
      return await db.collections.get(collectionId);
    },
    [collectionId],
    undefined as Collection | undefined
  );
}

export function useVersions(fileId?: string) {
  return useLiveQuery(
    async () => {
      if (!fileId) return [];
      return await db.versions.where('fileId').equals(fileId).reverse().sortBy('createdAt');
    },
    [fileId],
    [] as Version[]
  );
}

export function useAllTags() {
  return useLiveQuery(
    async () => {
      const files = await db.files.toArray();
      const tags = new Set<string>();
      files.forEach((f) => f.tags.forEach((t) => tags.add(t)));
      return Array.from(tags).sort();
    },
    [],
    [] as string[]
  );
}

export function useComponents(category?: string | null) {
  return useLiveQuery(
    async () => {
      let items: ComponentMetadata[];
      if (!category || category === 'all') {
        items = await db.components.toArray();
      } else {
        items = await db.components.where('category').equals(category).toArray();
      }
      return items.sort((a, b) => a.name.localeCompare(b.name));
    },
    [category],
    [] as ComponentMetadata[]
  );
}

export function useComponent(id?: string) {
  return useLiveQuery(
    async () => {
      if (!id) return undefined;
      return await db.components.get(id);
    },
    [id],
    undefined
  );
}

export function useFavoriteComponents() {
  return useLiveQuery(
    async () => {
      return await db.components.filter((c) => c.favorite).toArray();
    },
    [],
    []
  );
}

