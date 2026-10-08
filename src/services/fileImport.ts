import { filesRepo } from '../db/files.repo';
import { extractTitle } from '../domain/titleFromContent';

export interface ImportedFileInfo {
  file: File;
  content: string;
  relativePath?: string;
}

/**
 * Traverses file items, recursively reading folders if dropped via webkitGetAsEntry.
 */
export async function getFilesFromDataTransfer(
  items: DataTransferItemList
): Promise<File[]> {
  const files: File[] = [];

  const traverseEntry = async (entry: any): Promise<void> => {
    if (!entry) return;

    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => {
        entry.file(resolve, reject);
      });
      if (file.name.match(/\.(md|markdown|txt)$/i)) {
        files.push(file);
      }
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const entries = await new Promise<any[]>((resolve) => {
        const results: any[] = [];
        const readEntries = () => {
          dirReader.readEntries((batch: any[]) => {
            if (!batch.length) {
              resolve(results);
            } else {
              results.push(...batch);
              readEntries();
            }
          });
        };
        readEntries();
      });

      for (const child of entries) {
        await traverseEntry(child);
      }
    }
  };

  const promises: Promise<void>[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.webkitGetAsEntry) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        promises.push(traverseEntry(entry));
        continue;
      }
    }
    const file = item.getAsFile();
    if (file && file.name.match(/\.(md|markdown|txt)$/i)) {
      files.push(file);
    }
  }

  await Promise.all(promises);
  return files;
}

/**
 * Saves a list of imported files into IndexedDB, deduping where appropriate.
 */
export async function importFilesList(
  files: File[],
  collectionId: string | null = null
): Promise<{ added: number; skipped: number }> {
  let added = 0;
  let skipped = 0;

  for (const file of files) {
    if (!file.name.match(/\.(md|markdown|txt)$/i)) {
      continue;
    }

    const content = await file.text();
    const existing = await filesRepo.findDuplicate(file.name, content);
    if (existing) {
      skipped++;
      continue;
    }

    await filesRepo.create({
      title: extractTitle(content, file.name),
      filename: file.name,
      content,
      collectionId,
      tags: [],
      pinned: false,
      size: file.size || content.length,
    });
    added++;
  }

  return { added, skipped };
}
