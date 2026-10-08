import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DropOverlay } from '../library/DropOverlay';
import { BundleTray } from '../bundle/BundleTray';
import { ToastContainer } from '../ui/Toast';
import { QuickAddModal } from '../library/QuickAddModal';
import { CollectionModal } from '../collections/CollectionModal';
import { useUIStore } from '../../store/uiStore';
import { getFilesFromDataTransfer, importFilesList } from '../../services/fileImport';
import { Collection } from '../../domain/types';

export const Shell: React.FC = () => {
  const { isWindowDragOver, setIsWindowDragOver, showToast, pastedText, setPastedText } =
    useUIStore();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Global window drag & drop handling
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsWindowDragOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsWindowDragOver(false);
        dragCounter = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsWindowDragOver(false);

      if (e.dataTransfer && e.dataTransfer.items) {
        try {
          const files = await getFilesFromDataTransfer(e.dataTransfer.items);
          if (files.length > 0) {
            const result = await importFilesList(files);
            showToast(
              `Stashed ${result.added} markdown file(s)${
                result.skipped > 0 ? ` (${result.skipped} duplicate skipped)` : ''
              }`,
              'success'
            );
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to import dropped files', 'error');
        }
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [setIsWindowDragOver, showToast]);

  // Global paste handler (Ctrl+V creates quick-add)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement)?.isContentEditable ||
        Boolean(activeEl?.closest?.('input, textarea, [contenteditable="true"]')) ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        Boolean(target?.closest?.('input, textarea, [contenteditable="true"]'));

      if (!isInput && e.clipboardData) {
        const text = e.clipboardData.getData('text/plain');
        if (text && text.trim().length > 0) {
          e.preventDefault();
          setPastedText(text);
          setIsQuickAddOpen(true);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [setPastedText]);

  const handleNewCollection = () => {
    setEditingCollection(null);
    setIsCollectionModalOpen(true);
  };

  const handleEditCollection = (c: Collection) => {
    setEditingCollection(c);
    setIsCollectionModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-sage text-cream">
      {/* Sidebar */}
      <Sidebar
        onNewCollection={handleNewCollection}
        onEditCollection={handleEditCollection}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar onNewFile={() => { setPastedText(null); setIsQuickAddOpen(true); }} />

        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>

      {/* Global Drag Overlay */}
      <DropOverlay isVisible={isWindowDragOver} />

      {/* Bottom Bundle Tray */}
      <BundleTray />

      {/* Live Toast Container */}
      <ToastContainer />

      {/* Quick Add / Paste Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => {
          setIsQuickAddOpen(false);
          setPastedText(null);
        }}
        initialContent={pastedText || ''}
      />

      {/* Collection Modal */}
      <CollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => {
          setIsCollectionModalOpen(false);
          setEditingCollection(null);
        }}
        collection={editingCollection}
      />
    </div>
  );
};
