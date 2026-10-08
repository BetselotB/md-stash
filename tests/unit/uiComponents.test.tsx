import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { db } from '../../src/db/schema';
import { filesRepo } from '../../src/db/files.repo';
import { QuickAddModal } from '../../src/components/library/QuickAddModal';
import { FileCard } from '../../src/components/library/FileCard';
import { StashFile } from '../../src/domain/types';

describe('UI Components Integration Tests', () => {
  beforeEach(async () => {
    await db.files.clear();
    await db.collections.clear();
  });

  it('renders FileCard and shows title, filename, and tags', () => {
    const file: StashFile = {
      id: 'f1',
      title: 'Documentation Guide',
      filename: 'docs.md',
      content: '# Guide Content',
      collectionId: null,
      tags: ['guide', 'docs'],
      pinned: false,
      size: 100,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const onOpen = vi.fn();

    render(
      <BrowserRouter>
        <FileCard file={file} onOpen={onOpen} viewMode="grid" />
      </BrowserRouter>
    );

    expect(screen.getByText('Documentation Guide')).toBeInTheDocument();
    expect(screen.getByText('docs.md')).toBeInTheDocument();
    expect(screen.getByText('#guide')).toBeInTheDocument();
  });

  it('submits QuickAddModal and saves new file to database', async () => {
    const onClose = vi.fn();

    render(
      <QuickAddModal
        isOpen={true}
        onClose={onClose}
        initialContent={"# Important System Note\nNever leak private data."}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /save to stash/i });
    fireEvent.click(submitBtn);

    await waitFor(async () => {
      const files = await filesRepo.getAll();
      expect(files.length).toBe(1);
      expect(files[0].title).toBe('Important System Note');
    });

    expect(onClose).toHaveBeenCalled();
  });
});
