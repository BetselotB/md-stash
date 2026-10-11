import { filesRepo } from '../db/files.repo';
import { collectionsRepo } from '../db/collections.repo';
import { extractTitle } from '../domain/titleFromContent';
import { importExportService } from './importExport';

export interface ImportedFileInfo {
  file: File;
  content: string;
  relativePath?: string;
}

/**
 * Traverses file items, recursively reading folders if dropped via webkitGetAsEntry.
 */
export async function getFilesFromDataTransfer(
  items: DataTransferItemList | FileList
): Promise<File[]> {
  const files: File[] = [];

  // If passed a standard FileList (e.g. from e.dataTransfer.files)
  if (!('length' in items) || items.length === 0) return files;

  // Check if items are DataTransferItem with webkitGetAsEntry
  const firstItem = items[0] as unknown as { webkitGetAsEntry?: unknown; getAsFile?: unknown };
  if (!firstItem || typeof firstItem.webkitGetAsEntry !== 'function') {
    for (let i = 0; i < items.length; i++) {
      const file = (items as unknown as FileList)[i];
      if (file && file.name.match(/\.(md|markdown|txt|zip)$/i)) {
        files.push(file);
      }
    }
    return files;
  }

  const transferItems = items as DataTransferItemList;

  const traverseEntry = async (entry: any): Promise<void> => {
    if (!entry) return;

    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => {
        entry.file(resolve, reject);
      });
      if (file.name.match(/\.(md|markdown|txt|zip)$/i)) {
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
  for (let i = 0; i < transferItems.length; i++) {
    const item = transferItems[i];
    if (item.webkitGetAsEntry) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        promises.push(traverseEntry(entry));
        continue;
      }
    }
    const file = item.getAsFile();
    if (file && file.name.match(/\.(md|markdown|txt|zip)$/i)) {
      files.push(file);
    }
  }

  await Promise.all(promises);
  return files;
}

export interface ImportOptions {
  collectionId?: string | null;
  onConflict?: 'skip' | 'overwrite' | 'keepBoth';
}

export interface ImportResult {
  added: number;
  skipped: number;
  updated: number;
  collectionId: string | null;
  collectionName: string | null;
  message: string;
}

/**
 * Extracts the current collection id from window.location.pathname at the moment of invocation.
 */
export function getRouteCollectionId(): string | null {
  if (typeof window === 'undefined') return null;
  const pathname = window.location.pathname;
  const match = pathname.match(/\/app\/c\/([^/?#]+)/);
  if (!match) return null;
  const rawId = match[1];
  if (rawId === 'unsorted' || rawId === '__unsorted') return null;
  return decodeURIComponent(rawId);
}

/**
 * Resolves the target collection from either explicit parameter or the current router URL.
 * - On /app/c/:collectionId, targets that collection if it exists; otherwise falls back to Unsorted (null).
 * - On /app, Pinned, Unsorted, Search, etc., targets Unsorted (null).
 */
export async function getTargetCollectionFromRoute(
  explicitCollectionId?: string | null
): Promise<{ collectionId: string | null; collectionName: string | null }> {
  const colId = explicitCollectionId !== undefined ? explicitCollectionId : getRouteCollectionId();
  if (!colId || colId === 'unsorted' || colId === '__unsorted') {
    return { collectionId: null, collectionName: null };
  }

  const col = await collectionsRepo.getById(colId);
  if (col) {
    return { collectionId: col.id, collectionName: col.name };
  }
  return { collectionId: null, collectionName: null };
}

/**
 * Saves a list of imported files into IndexedDB, deduping where appropriate,
 * routing into the target collection.
 */
export async function importFilesList(
  files: File[],
  options?: string | null | ImportOptions
): Promise<ImportResult> {
  let requestedColId: string | null | undefined = undefined;
  let onConflict: 'skip' | 'overwrite' | 'keepBoth' = 'skip';

  if (typeof options === 'string') {
    requestedColId = options;
  } else if (options && typeof options === 'object') {
    requestedColId = options.collectionId;
    if (options.onConflict) onConflict = options.onConflict;
  }

  // Resolve target collection at invocation time
  const target = await getTargetCollectionFromRoute(requestedColId);
  const collectionId = target.collectionId;
  const collectionName = target.collectionName;

  let added = 0;
  let skipped = 0;
  let updated = 0;
  let zipFilesCount = 0;

async function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return await file.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

  for (const file of files) {
    if (file.name.match(/\.zip$/i)) {
      try {
        const zipRes = await importExportService.importZip(file);
        zipFilesCount += zipRes.filesCount;
        added += zipRes.filesCount;
      } catch (err) {
        console.error('Failed to import zip file', err);
      }
      continue;
    }

    if (!file.name.match(/\.(md|markdown|txt)$/i)) {
      continue;
    }

    const content = await readFileText(file);
    const exactDuplicate = await filesRepo.findDuplicate(file.name, content);
    if (exactDuplicate) {
      skipped++;
      continue;
    }

    const sameNameFile = await filesRepo.findByFilename(file.name);
    if (sameNameFile) {
      if (onConflict === 'overwrite') {
        await filesRepo.update(sameNameFile.id, {
          content,
          size: file.size || content.length,
          title: extractTitle(content, file.name),
          collectionId,
        });
        updated++;
        continue;
      } else if (onConflict === 'keepBoth') {
        const dotIndex = file.name.lastIndexOf('.');
        const baseName = dotIndex !== -1 ? file.name.slice(0, dotIndex) : file.name;
        const ext = dotIndex !== -1 ? file.name.slice(dotIndex) : '.md';
        const uniqueName = `${baseName}-${Date.now().toString().slice(-4)}${ext}`;

        await filesRepo.create({
          title: extractTitle(content, uniqueName),
          filename: uniqueName,
          content,
          collectionId,
          tags: [],
          pinned: false,
          size: file.size || content.length,
        });
        added++;
        continue;
      } else {
        skipped++;
        continue;
      }
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

  // Format success message with target collection and skipped duplicate count
  let message = '';
  const skipText = skipped > 0 ? ` (${skipped} skipped)` : '';
  if (zipFilesCount > 0 && added === zipFilesCount) {
    message = `Restored ${zipFilesCount} file(s) from zip`;
  } else if (added > 0) {
    const fileWord = added === 1 ? 'file' : 'files';
    if (collectionName) {
      message = `${added} ${fileWord} added to ${collectionName}${skipText}`;
    } else {
      message = `${added} ${fileWord} added to stash${skipText}`;
    }
  } else if (updated > 0) {
    message = `Updated ${updated} file${updated === 1 ? '' : 's'}${skipText}`;
  } else {
    message = `0 files added${skipText}`;
  }

  return { added, skipped, updated, collectionId, collectionName, message };
}

export const importFiles = importFilesList;
