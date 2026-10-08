import { CopyMode } from './types';

/**
 * Formats a single file for clipboard copy according to the selected mode.
 */
export function formatFileForCopy(
  filename: string,
  content: string,
  mode: CopyMode = 'raw'
): string {
  switch (mode) {
    case 'codeblock': {
      // Find the longest sequence of backticks in the content to avoid breaking fence
      const backtickMatches = content.match(/`+/g);
      const maxBackticks = backtickMatches
        ? Math.max(...backtickMatches.map((m) => m.length))
        : 0;
      const fenceLength = Math.max(3, maxBackticks + 1);
      const fence = '`'.repeat(fenceLength);
      return `${fence}markdown\n${content}\n${fence}`;
    }
    case 'prompt': {
      return `### File: ${filename}\n\n${content}`;
    }
    case 'raw':
    default:
      return content;
  }
}
