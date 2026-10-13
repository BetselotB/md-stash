import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Dexie from 'dexie';
import 'fake-indexeddb/auto';
import { MDstashDatabase } from '../src/db/schema';
import { StashFile, Collection, Version, Setting } from '../src/domain/types';
import { ComponentMetadata, CodeBlob } from '../src/domain/componentTypes';

describe('Dexie v1 -> v2 Lossless Migration', () => {
  const TEST_DB_NAME = 'TestMigrationDB_' + Math.random().toString(36).substring(7);

  afterEach(async () => {
    await Dexie.delete(TEST_DB_NAME);
  });

  it('preserves all v1 user data when migrating to v2', async () => {
    // 1. Setup a legacy v1 database
    const v1Db = new Dexie(TEST_DB_NAME);
    v1Db.version(1).stores({
      files: 'id, collectionId, filename, *tags, pinned, updatedAt, title',
      collections: 'id, order',
      versions: 'id, fileId, createdAt',
      settings: 'key',
    });

    await v1Db.open();

    const sampleFile: StashFile = {
      id: 'note-1',
      title: 'AGENTS.md Prompt Guidelines',
      filename: 'AGENTS.md',
      content: '# Agent Instructions\nAlways search the component library first.',
      collectionId: 'col-1',
      tags: ['rules', 'ai'],
      pinned: true,
      size: 78,
      createdAt: 1000,
      updatedAt: 2000,
    };

    const sampleCollection: Collection = {
      id: 'col-1',
      name: 'Agent Guidelines',
      color: '#EEB257',
      icon: 'Folder',
      order: 1,
      createdAt: 1000,
    };

    const sampleVersion: Version = {
      id: 'ver-1',
      fileId: 'note-1',
      content: '# Initial Version',
      createdAt: 1000,
    };

    const sampleSetting: Setting = {
      key: 'theme',
      value: 'sage',
    };

    await v1Db.table('files').add(sampleFile);
    await v1Db.table('collections').add(sampleCollection);
    await v1Db.table('versions').add(sampleVersion);
    await v1Db.table('settings').add(sampleSetting);

    v1Db.close();

    // 2. Open with MDstashDatabase v2
    const v2Db = new MDstashDatabase(TEST_DB_NAME);
    await v2Db.open();

    expect(v2Db.verno).toBe(2);

    // 3. Verify all v1 data is 100% preserved
    const files = await v2Db.files.toArray();
    expect(files).toHaveLength(1);
    expect(files[0]).toEqual(sampleFile);

    const collections = await v2Db.collections.toArray();
    expect(collections).toHaveLength(1);
    expect(collections[0]).toEqual(sampleCollection);

    const versions = await v2Db.versions.toArray();
    expect(versions).toHaveLength(1);
    expect(versions[0]).toEqual(sampleVersion);

    const setting = await v2Db.settings.get('theme');
    expect(setting).toEqual(sampleSetting);

    // 4. Verify v2 tables are functional
    const sampleCompMeta: ComponentMetadata = {
      id: 'shimmer-button',
      name: 'Shimmer Button',
      kind: 'component',
      category: 'buttons',
      tags: ['button', 'shimmer', 'animation'],
      framework: 'react',
      styling: 'tailwind',
      requires: ['motion'],
      source: 'magic-ui',
      previewStatus: 'ready',
      thumb: 'buttons/shimmer-button.webp',
      license: 'MIT',
      attribution: 'Magic UI — MIT © Dillion Verma',
      favorite: true,
      origin: 'harvested',
      description: 'Shimmering interactive button with dynamic border animation.',
      depsCount: 1,
      updatedAt: 3000,
      createdAt: 3000,
    };

    const sampleCodeBlob: CodeBlob = {
      id: 'shimmer-button',
      code: 'export function ShimmerButton() { return <button>Click</button>; }',
      usage: '<ShimmerButton />',
      props: [{ name: 'shimmerColor', type: 'string', default: '#ffffff' }],
      deps: ['motion'],
      dependsOn: [],
      shared: ['utils/cn'],
    };

    await v2Db.components.add(sampleCompMeta);
    await v2Db.codeBlobs.add(sampleCodeBlob);

    const retrievedComp = await v2Db.components.get('shimmer-button');
    expect(retrievedComp?.name).toBe('Shimmer Button');
    expect(retrievedComp?.favorite).toBe(true);

    const retrievedBlob = await v2Db.codeBlobs.get('shimmer-button');
    expect(retrievedBlob?.code).toContain('ShimmerButton');

    // Test secondary indexes on components
    const favorites = await v2Db.components.filter((c) => c.favorite).toArray();
    expect(favorites).toHaveLength(1);

    const buttonComps = await v2Db.components.where('category').equals('buttons').toArray();
    expect(buttonComps).toHaveLength(1);

    v2Db.close();
  });
});
