import { StashFile } from '../domain/types';

/**
 * Attaches file content and DownloadURL to a drag event dataTransfer object,
 * allowing dragging the file out directly to the desktop or into editor/chat inputs.
 */
export function setupDragOut(event: React.DragEvent, file: StashFile): () => void {
  const dt = event.dataTransfer;
  if (!dt) return () => {};

  // 1. Plain text format for text editors, terminal, and AI chat input boxes
  dt.setData('text/plain', file.content);

  // 2. DownloadURL format (supported in Chromium browsers for dropping files to Desktop/Explorer)
  const blob = new Blob([file.content], { type: 'text/markdown;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const mimeType = 'text/markdown';
  const downloadUrl = `${mimeType}:${file.filename}:${blobUrl}`;

  try {
    dt.setData('DownloadURL', downloadUrl);
  } catch (err) {
    // In some environments setData with DownloadURL might throw
  }

  dt.effectAllowed = 'copyMove';

  // Return cleanup function to revoke URL after drag completes
  return () => {
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);
  };
}
