import { describe, it, expect, vi } from 'vitest';
import { setupDragOut } from '../../src/services/dragOut';
import { StashFile } from '../../src/domain/types';

describe('setupDragOut unit tests', () => {
  it('sets text/plain and DownloadURL on dataTransfer', () => {
    const file: StashFile = {
      id: 'test-1',
      title: 'Test File',
      filename: 'sample.md',
      content: '# Hello World\nThis is markdown.',
      collectionId: null,
      tags: [],
      pinned: false,
      size: 30,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const setDataMap: Record<string, string> = {};
    const mockDataTransfer = {
      setData: vi.fn((format: string, data: string) => {
        setDataMap[format] = data;
      }),
      effectAllowed: '',
    };

    const mockEvent = {
      dataTransfer: mockDataTransfer,
    } as unknown as React.DragEvent;

    // Call setupDragOut
    const cleanup = setupDragOut(mockEvent, file);

    // Verify text/plain
    expect(mockDataTransfer.setData).toHaveBeenCalledWith('text/plain', file.content);
    expect(setDataMap['text/plain']).toBe(file.content);

    // Verify DownloadURL
    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'DownloadURL',
      expect.stringContaining(`text/markdown:${file.filename}:blob:`)
    );

    // Verify effectAllowed
    expect(mockDataTransfer.effectAllowed).toBe('copyMove');

    // Call cleanup
    expect(typeof cleanup).toBe('function');
    cleanup();
  });
});
