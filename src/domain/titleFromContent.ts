/**
 * Extracts a display title from markdown content, falling back to the filename.
 * Searches for first # heading or title line.
 */
export function extractTitle(content: string, filename: string): string {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      const title = trimmed.replace(/^#\s+/, '').trim();
      if (title.length > 0) return title;
    }
  }

  // Fallback to filename without extension, or filename
  const cleanName = filename.replace(/\.(md|markdown|txt)$/i, '').trim();
  return cleanName || filename || 'Untitled Note';
}

/**
 * Computes a fast deterministic hash string of the content for deduplication.
 */
export function hashContent(content: string): string {
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) + hash) + content.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
}
