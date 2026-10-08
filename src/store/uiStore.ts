import { create } from 'zustand';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface UIStore {
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // View state
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;

  // Bundle selection
  selectedFileIds: string[];
  toggleSelectFile: (id: string) => void;
  selectFiles: (ids: string[]) => void;
  clearSelection: () => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;

  // Full-window drag overlay
  isWindowDragOver: boolean;
  setIsWindowDragOver: (over: boolean) => void;

  // Quick-add paste modal
  pastedText: string | null;
  setPastedText: (text: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  showToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3200);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  viewMode: 'grid',
  setViewMode: (viewMode) => set({ viewMode }),

  selectedFileIds: [],
  toggleSelectFile: (id) =>
    set((state) => ({
      selectedFileIds: state.selectedFileIds.includes(id)
        ? state.selectedFileIds.filter((x) => x !== id)
        : [...state.selectedFileIds, id],
    })),
  selectFiles: (ids) => set({ selectedFileIds: ids }),
  clearSelection: () => set({ selectedFileIds: [] }),

  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  activeTag: null,
  setActiveTag: (activeTag) => set({ activeTag }),

  isWindowDragOver: false,
  setIsWindowDragOver: (isWindowDragOver) => set({ isWindowDragOver }),

  pastedText: null,
  setPastedText: (pastedText) => set({ pastedText }),
}));
