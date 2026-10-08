import { StashFile, CopyMode } from './types';
import { formatFileForCopy } from './copyFormats';

export interface BundleOptions {
  mode?: CopyMode;
  includeIndexHeader?: boolean;
}

/**
 * Combines multiple stash files into a unified bundled text block
 * suitable for feeding directly to AI prompts, IDEs, or context windows.
 */
export function buildBundleText(
  files: StashFile[],
  options: BundleOptions = {}
): string {
  if (files.length === 0) return '';

  const { mode = 'prompt', includeIndexHeader = true } = options;

  const parts: string[] = [];

  if (includeIndexHeader && files.length > 1) {
    parts.push(
      `# Bundled Markdown Context (${files.length} files)\n` +
      files.map((f, i) => `${i + 1}. \`${f.filename}\` (${f.title})`).join('\n') +
      '\n\n---\n'
    );
  }

  for (const file of files) {
    if (mode === 'prompt') {
      parts.push(`### File: ${file.filename}\n\n${file.content}`);
    } else {
      parts.push(formatFileForCopy(file.filename, file.content, mode));
    }
  }

  return parts.join('\n\n---\n\n');
}
