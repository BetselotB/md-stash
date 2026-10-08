import MiniSearch from 'minisearch';
import { StashFile } from '../domain/types';

interface SearchDoc {
  id: string;
  title: string;
  filename: string;
  content: string;
  tags: string;
}

class SearchService {
  private miniSearch: MiniSearch<SearchDoc>;
  private indexedIds: Set<string> = new Set();

  constructor() {
    this.miniSearch = new MiniSearch<SearchDoc>({
      fields: ['title', 'filename', 'tags', 'content'],
      storeFields: ['id', 'title', 'filename'],
      searchOptions: {
        boost: { title: 3, filename: 2, tags: 2, content: 1 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
  }

  sync(files: StashFile[]) {
    const currentFileIds = new Set(files.map((f) => f.id));

    // Remove deleted files
    for (const id of this.indexedIds) {
      if (!currentFileIds.has(id)) {
        this.miniSearch.discard(id);
        this.indexedIds.delete(id);
      }
    }

    // Add or update
    for (const file of files) {
      const doc: SearchDoc = {
        id: file.id,
        title: file.title,
        filename: file.filename,
        content: file.content,
        tags: file.tags.join(' '),
      };

      if (this.indexedIds.has(file.id)) {
        this.miniSearch.replace(doc);
      } else {
        this.miniSearch.add(doc);
        this.indexedIds.add(file.id);
      }
    }
  }

  search(query: string): string[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    try {
      const results = this.miniSearch.search(trimmed);
      return results.map((r) => r.id);
    } catch {
      return [];
    }
  }

  clear() {
    this.miniSearch.removeAll();
    this.indexedIds.clear();
  }
}

export const searchService = new SearchService();
