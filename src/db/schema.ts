import Dexie, { type Table } from 'dexie';
import { StashFile, Collection, Version, Setting } from '../domain/types';

export class MDstashDatabase extends Dexie {
  files!: Table<StashFile, string>;
  collections!: Table<Collection, string>;
  versions!: Table<Version, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('MDstashDB');

    this.version(1).stores({
      files: 'id, collectionId, filename, *tags, pinned, updatedAt, title',
      collections: 'id, order',
      versions: 'id, fileId, createdAt',
      settings: 'key',
    });
  }
}

export const db = new MDstashDatabase();

if (typeof window !== 'undefined') {
  (window as unknown as { __db: typeof db }).__db = db;
}
