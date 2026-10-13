import Dexie, { type Table } from 'dexie';
import { StashFile, Collection, Version, Setting } from '../domain/types';
import {
  ComponentMetadata,
  CodeBlob,
  KitItem,
  CompVersion,
  WishlistItem,
} from '../domain/componentTypes';

export class MDstashDatabase extends Dexie {
  // Version 1 tables (Preserved losslessly for Docs & Rules / Kits)
  files!: Table<StashFile, string>;
  collections!: Table<Collection, string>;
  versions!: Table<Version, string>;
  settings!: Table<Setting, string>;

  // Version 2 tables (Component Library Platform)
  components!: Table<ComponentMetadata, string>;
  codeBlobs!: Table<CodeBlob, string>;
  kitItems!: Table<KitItem, [string, string]>;
  compVersions!: Table<CompVersion, string>;
  wishlist!: Table<WishlistItem, string>;
  sync!: Table<{ key: string; value: unknown }, string>;

  constructor(databaseName = 'MDstashDB') {
    super(databaseName);

    // v1 schema
    this.version(1).stores({
      files: 'id, collectionId, filename, *tags, pinned, updatedAt, title',
      collections: 'id, order',
      versions: 'id, fileId, createdAt',
      settings: 'key',
    });

    // v2 additive schema
    this.version(2).stores({
      files: 'id, collectionId, filename, *tags, pinned, updatedAt, title',
      collections: 'id, order',
      versions: 'id, fileId, createdAt',
      settings: 'key',
      components: 'id, name, category, kind, source, favorite, origin, updatedAt, *tags, previewStatus',
      codeBlobs: 'id',
      kitItems: '[kitId+id], kitId, order',
      compVersions: 'id, componentId, createdAt',
      wishlist: 'id, status, createdAt',
      sync: 'key',
    });
  }
}

export const db = new MDstashDatabase();

if (typeof window !== 'undefined') {
  (window as unknown as { __db: typeof db }).__db = db;
}
