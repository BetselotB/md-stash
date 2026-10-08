import { describe, it, expect } from 'vitest';
import { extractTitle, hashContent } from '../../src/domain/titleFromContent';
import { formatFileForCopy } from '../../src/domain/copyFormats';
import { buildBundleText } from '../../src/domain/bundle';
import { StashFile } from '../../src/domain/types';

describe('Domain logic tests', () => {
  it('extractTitle extracts title from H1 or fallback to filename', () => {
    const mdWithH1 = '# My Awesome Project\nSome body text';
    expect(extractTitle(mdWithH1, 'README.md')).toBe('My Awesome Project');

    const mdWithoutH1 = 'Just paragraph text without any heading.';
    expect(extractTitle(mdWithoutH1, 'CLAUDE.md')).toBe('CLAUDE');
  });

  it('hashContent produces deterministic hashes', () => {
    const content = '# Test markdown';
    const hash1 = hashContent(content);
    const hash2 = hashContent(content);
    expect(hash1).toBe(hash2);
    expect(hashContent('different content')).not.toBe(hash1);
  });

  it('formatFileForCopy formats raw, codeblock, and prompt modes correctly', () => {
    const filename = 'notes.md';
    const content = 'Line 1\nLine 2';

    // Raw mode
    expect(formatFileForCopy(filename, content, 'raw')).toBe(content);

    // Codeblock mode
    const codeBlock = formatFileForCopy(filename, content, 'codeblock');
    expect(codeBlock).toContain('```markdown');
    expect(codeBlock).toContain(content);

    // Prompt mode
    const prompt = formatFileForCopy(filename, content, 'prompt');
    expect(prompt).toContain('### File: notes.md');
    expect(prompt).toContain(content);
  });

  it('buildBundleText combines multiple files with headers', () => {
    const files: StashFile[] = [
      {
        id: '1',
        title: 'File One',
        filename: 'file1.md',
        content: 'Content 1',
        collectionId: null,
        tags: [],
        pinned: false,
        size: 9,
        createdAt: 100,
        updatedAt: 100,
      },
      {
        id: '2',
        title: 'File Two',
        filename: 'file2.md',
        content: 'Content 2',
        collectionId: null,
        tags: [],
        pinned: false,
        size: 9,
        createdAt: 200,
        updatedAt: 200,
      },
    ];

    const bundle = buildBundleText(files, { mode: 'prompt' });
    expect(bundle).toContain('Bundled Markdown Context (2 files)');
    expect(bundle).toContain('### File: file1.md');
    expect(bundle).toContain('### File: file2.md');
  });
});
