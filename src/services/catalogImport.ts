import { db } from '../db/schema';
import { ComponentMetadata } from '../domain/componentTypes';
import { searchService } from './search';

export type ImportStatus = 'idle' | 'importing' | 'ready' | 'error';

export interface ImportProgress {
  status: ImportStatus;
  total: number;
  imported: number;
  percentage: number;
  error?: string;
}

type ProgressListener = (progress: ImportProgress) => void;

class CatalogImportService {
  private listeners: Set<ProgressListener> = new Set();
  private currentProgress: ImportProgress = {
    status: 'idle',
    total: 0,
    imported: 0,
    percentage: 0,
  };
  private isImporting = false;

  public subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    listener(this.currentProgress);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener({ ...this.currentProgress });
      } catch (err) {
        console.error('Error in catalog import listener:', err);
      }
    }
  }

  public getProgress(): ImportProgress {
    return { ...this.currentProgress };
  }

  /**
   * Imports metadata catalog into Dexie.
   * If database already contains components, skips re-import unless force is true.
   */
  public async importCatalogIfNeeded(options: {
    url?: string;
    force?: boolean;
    batchSize?: number;
  } = {}): Promise<void> {
    const { url = '/catalog.json', force = false, batchSize = 500 } = options;

    if (this.isImporting) return;

    try {
      const existingCount = await db.components.count();
      if (existingCount > 0 && !force) {
        this.currentProgress = {
          status: 'ready',
          total: existingCount,
          imported: existingCount,
          percentage: 100,
        };
        this.notify();
        return;
      }

      this.isImporting = true;
      this.currentProgress = {
        status: 'importing',
        total: 0,
        imported: 0,
        percentage: 0,
      };
      this.notify();

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load catalog from ${url}: ${response.statusText}`);
      }

      const items: ComponentMetadata[] = await response.json();
      const total = items.length;

      this.currentProgress.total = total;
      this.notify();

      // Chunked bulkPut into IndexedDB
      for (let i = 0; i < total; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await db.components.bulkPut(batch);

        this.currentProgress.imported = Math.min(i + batch.length, total);
        this.currentProgress.percentage = Math.round(
          (this.currentProgress.imported / total) * 100
        );
        this.notify();
      }

      // Sync into MiniSearch client index
      searchService.syncComponents(items);

      this.currentProgress.status = 'ready';
      this.notify();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to import component catalog:', errorMsg);
      this.currentProgress.status = 'error';
      this.currentProgress.error = errorMsg;
      this.notify();
      throw err;
    } finally {
      this.isImporting = false;
    }
  }
}

export const catalogImportService = new CatalogImportService();
