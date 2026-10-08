import { describe, it, expect, beforeEach } from 'vitest';
import { searchService } from '../../src/services/search';
import { StashFile } from '../../src/domain/types';

describe('Search service tests', () => {
  beforeEach(() => {
    searchService.clear();
  });

  it('searches by title, tag, and content, boosting title matches', () => {
    const file1: StashFile = {
      id: 'f1',
      title: 'Python Guidelines',
      filename: 'python.md',
      content: 'General tips about development and coding.',
      collectionId: null,
      tags: ['coding'],
      pinned: false,
      size: 40,
      createdAt: 1,
      updatedAt: 1,
    };

    const file2: StashFile = {
      id: 'f2',
      title: 'General Setup',
      filename: 'setup.md',
      content: 'Here we install python packages and environment.',
      collectionId: null,
      tags: ['setup'],
      pinned: false,
      size: 45,
      createdAt: 2,
      updatedAt: 2,
    };

    searchService.sync([file1, file2]);

    // Search "python": file1 has python in title, file2 has python in content
    const results = searchService.search('python');
    expect(results.length).toBe(2);
    // f1 should be ranked first because title has boost
    expect(results[0]).toBe('f1');
    expect(results[1]).toBe('f2');
  });

  it('updates index when files are deleted or updated', () => {
    const file: StashFile = {
      id: 'f1',
      title: 'Temporary File',
      filename: 'temp.md',
      content: 'Temporary content',
      collectionId: null,
      tags: ['temp'],
      pinned: false,
      size: 15,
      createdAt: 1,
      updatedAt: 1,
    };

    searchService.sync([file]);
    expect(searchService.search('Temporary').length).toBe(1);

    // Sync without f1 (representing deletion)
    searchService.sync([]);
    expect(searchService.search('Temporary').length).toBe(0);
  });
});
