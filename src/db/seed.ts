import { db } from './schema';
import { filesRepo } from './files.repo';

const STARTER_FILE_ID = 'starter-mdstash-note';
let isSeeding = false;

export async function seedInitialDataIfNeeded(): Promise<void> {
  if (isSeeding) return;
  isSeeding = true;

  try {
    const allFiles = await db.files.toArray();

    // If the database has the old 3 test starter files, migrate them to the single MDstash card
    const isOldTestSeed =
      allFiles.length === 3 &&
      allFiles.some((f) => f.filename === 'CLAUDE.md') &&
      allFiles.some((f) => f.filename === '.cursorrules') &&
      allFiles.some((f) => f.filename === 'README-starter.md');

    if (isOldTestSeed) {
      await db.files.clear();
      await db.collections.clear();
      await db.versions.clear();
    } else if (allFiles.length > 0) {
      return;
    }

    const colCount = await db.collections.count();
    if (colCount > 0 && !isOldTestSeed) return;

    const content = `# Welcome to MDstash

A pure, local-first stash for your markdown files.

- **Offline-ready**: Everything stays securely on your device in IndexedDB.
- **Drag & drop**: Drop markdown files or folders directly into your stash.
- **Copy prompt-ready**: Copy notes formatted for AI chats and IDEs with a single click.
`;

    // Idempotent put using fixed starter ID
    await filesRepo.create({
      id: STARTER_FILE_ID,
      title: 'MDstash',
      filename: 'MDstash.md',
      content,
      collectionId: null,
      tags: ['example'],
      pinned: false,
      size: new Blob([content]).size,
    });
  } finally {
    isSeeding = false;
  }
}
