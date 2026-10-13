import MiniSearch from 'minisearch';
import { StashFile } from '../domain/types';
import { ComponentMetadata } from '../domain/componentTypes';

interface FileSearchDoc {
  id: string;
  title: string;
  filename: string;
  content: string;
  tags: string;
}

export interface ComponentSearchDoc {
  id: string;
  name: string;
  tags: string;
  category: string;
  description: string;
  requires: string;
  source: string;
  styling: string;
  favorite: boolean;
  previewStatus: string;
}

export interface ComponentSearchResult {
  id: string;
  score: number;
}

class SearchService {
  private fileMiniSearch: MiniSearch<FileSearchDoc>;
  private componentMiniSearch: MiniSearch<ComponentSearchDoc>;
  private indexedFileIds: Set<string> = new Set();
  private indexedCompIds: Set<string> = new Set();

  constructor() {
    this.fileMiniSearch = new MiniSearch<FileSearchDoc>({
      fields: ['title', 'filename', 'tags', 'content'],
      storeFields: ['id', 'title', 'filename'],
      searchOptions: {
        boost: { title: 3, filename: 2, tags: 2, content: 1 },
        fuzzy: 0.2,
        prefix: true,
      },
    });

    this.componentMiniSearch = new MiniSearch<ComponentSearchDoc>({
      fields: ['name', 'tags', 'category', 'description', 'requires'],
      storeFields: ['id', 'name', 'category', 'styling', 'favorite', 'previewStatus'],
      searchOptions: {
        boost: { name: 6, tags: 4, category: 2, description: 2, requires: 1 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
  }

  // --- Files (Docs & Rules) ---

  sync(files: StashFile[]) {
    const currentFileIds = new Set(files.map((f) => f.id));

    for (const id of this.indexedFileIds) {
      if (!currentFileIds.has(id)) {
        this.fileMiniSearch.discard(id);
        this.indexedFileIds.delete(id);
      }
    }

    for (const file of files) {
      const doc: FileSearchDoc = {
        id: file.id,
        title: file.title,
        filename: file.filename,
        content: file.content,
        tags: file.tags.join(' '),
      };

      if (this.indexedFileIds.has(file.id)) {
        this.fileMiniSearch.replace(doc);
      } else {
        this.fileMiniSearch.add(doc);
        this.indexedFileIds.add(file.id);
      }
    }
  }

  search(query: string): string[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    try {
      const results = this.fileMiniSearch.search(trimmed);
      return results.map((r) => r.id);
    } catch {
      return [];
    }
  }

  // --- Components (8k Component Catalog) ---

  syncComponents(components: ComponentMetadata[]) {
    const currentCompIds = new Set(components.map((c) => c.id));

    for (const id of this.indexedCompIds) {
      if (!currentCompIds.has(id)) {
        this.componentMiniSearch.discard(id);
        this.indexedCompIds.delete(id);
      }
    }

    const docsToAdd: ComponentSearchDoc[] = [];

    for (const comp of components) {
      const doc: ComponentSearchDoc = {
        id: comp.id,
        name: comp.name,
        tags: comp.tags.join(' '),
        category: comp.category,
        description: comp.description,
        requires: comp.requires.join(' '),
        source: comp.source,
        styling: comp.styling,
        favorite: comp.favorite,
        previewStatus: comp.previewStatus,
      };

      if (this.indexedCompIds.has(comp.id)) {
        this.componentMiniSearch.replace(doc);
      } else {
        docsToAdd.push(doc);
        this.indexedCompIds.add(comp.id);
      }
    }

    if (docsToAdd.length > 0) {
      this.componentMiniSearch.addAll(docsToAdd);
    }
  }

  searchComponents(query: string, options: {
    category?: string;
    styling?: string;
    onlyFavorites?: boolean;
    limit?: number;
  } = {}): ComponentSearchResult[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    try {
      const rawResults = this.componentMiniSearch.search(trimmed);

      const filtered = rawResults
        .filter((r) => {
          if (options.category && r.category !== options.category) return false;
          if (options.styling && r.styling !== options.styling) return false;
          if (options.onlyFavorites && !r.favorite) return false;
          return true;
        })
        .map((r) => {
          // Ranking boosts consistent with edge FTS5 spec
          let boost = 1.0;
          if (r.favorite) boost *= 1.5;
          if (r.previewStatus === 'ready') boost *= 1.15;
          if (r.styling === 'tailwind') boost *= 1.2;

          return {
            id: r.id,
            score: r.score * boost,
          };
        })
        .sort((a, b) => b.score - a.score);

      const limit = options.limit || 50;
      return filtered.slice(0, limit);
    } catch {
      return [];
    }
  }

  clear() {
    this.fileMiniSearch.removeAll();
    this.indexedFileIds.clear();
  }

  clearComponents() {
    this.componentMiniSearch.removeAll();
    this.indexedCompIds.clear();
  }

  clearAll() {
    this.clear();
    this.clearComponents();
  }
}

export const searchService = new SearchService();
