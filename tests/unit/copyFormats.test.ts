import { describe, it, expect } from 'vitest';
import { formatFileForCopy } from '../../src/domain/copyFormats';

describe('formatFileForCopy comprehensive tests', () => {
  it('handles empty content', () => {
    expect(formatFileForCopy('empty.md', '', 'raw')).toBe('');
    expect(formatFileForCopy('empty.md', '', 'prompt')).toBe('### File: empty.md\n\n');
    expect(formatFileForCopy('empty.md', '', 'codeblock')).toBe('```markdown\n\n```');
  });

  it('safely handles content containing triple backticks by extending fence length', () => {
    const contentWithCode = 'Here is code:\n```typescript\nconst x = 1;\n```';
    const result = formatFileForCopy('code.md', contentWithCode, 'codeblock');

    // Should use 4 backticks for fence because content contains 3 backticks
    expect(result.startsWith('````markdown\n')).toBe(true);
    expect(result.endsWith('\n````')).toBe(true);
    expect(result).toContain(contentWithCode);
  });

  it('safely handles content containing 5 backticks by using 6 backticks', () => {
    const content = 'Five backticks: `````';
    const result = formatFileForCopy('five.md', content, 'codeblock');

    expect(result.startsWith('``````markdown\n')).toBe(true);
    expect(result.endsWith('\n``````')).toBe(true);
  });

  it('handles large markdown documents without degradation', () => {
    const largeContent = '# Large Doc\n' + 'Paragraph text with words.\n'.repeat(10000);
    const start = performance.now();
    const result = formatFileForCopy('large.md', largeContent, 'codeblock');
    const elapsed = performance.now() - start;

    expect(result.length).toBeGreaterThan(largeContent.length);
    expect(elapsed).toBeLessThan(100); // Fast pure JS string processing
  });

  it('formats prompt-ready with proper filename header', () => {
    const result = formatFileForCopy('CLAUDE.md', 'System prompt', 'prompt');
    expect(result).toBe('### File: CLAUDE.md\n\nSystem prompt');
  });
});
