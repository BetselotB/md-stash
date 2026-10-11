import React, { useRef, useEffect } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useFiles, usePinnedFiles, useCollections, useCollection } from '../../hooks/useDb';
import { importFiles, getRouteCollectionId } from '../../services/fileImport';
import {
  Search,
  LayoutGrid,
  List,
  Upload,
  Settings as SettingsIcon,
  X,
  Menu,
} from 'lucide-react';

interface TopbarProps {
  onNewFile: () => void;
  onToggleMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onNewFile, onToggleMobileMenu }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { collectionId } = useParams<{ collectionId?: string }>();

  const allFiles = useFiles();
  const pinnedFiles = usePinnedFiles();
  const collections = useCollections();
  const activeCol = useCollection(collectionId === 'unsorted' ? undefined : collectionId);

  const {
    searchQuery,
    setSearchQuery,
    activeTag,
    viewMode,
    setViewMode,
    showToast,
  } = useUIStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global "/" shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const targetColId = getRouteCollectionId();
      const res = await importFiles(filesArray, { collectionId: targetColId });
      showToast(res.message, res.added > 0 ? 'success' : 'info');
      e.target.value = '';
    }
  };

  // Derive sentence case title and subtitle
  let pageTitle = 'All files';
  let pageCount = `${allFiles.length} file${allFiles.length === 1 ? '' : 's'} in your local stash`;

  const isPinned = searchParams.get('filter') === 'pinned';
  if (isPinned) {
    pageTitle = 'Pinned';
    pageCount = `${pinnedFiles.length} file${pinnedFiles.length === 1 ? '' : 's'}`;
  } else if (activeTag) {
    pageTitle = `Tagged #${activeTag}`;
    const taggedCount = allFiles.filter((f) => f.tags.includes(activeTag)).length;
    pageCount = `${taggedCount} file${taggedCount === 1 ? '' : 's'}`;
  } else if (searchQuery.trim()) {
    pageTitle = `Search: "${searchQuery}"`;
    pageCount = 'Matching files in stash';
  } else if (location.pathname.startsWith('/app/c/')) {
    if (collectionId === 'unsorted') {
      pageTitle = 'Unsorted';
      const unsortedCount = allFiles.filter((f) => f.collectionId === null).length;
      pageCount = `${unsortedCount} file${unsortedCount === 1 ? '' : 's'}`;
    } else if (activeCol) {
      pageTitle = activeCol.name;
      const colCount = allFiles.filter((f) => f.collectionId === activeCol.id).length;
      pageCount = `${colCount} file${colCount === 1 ? '' : 's'}`;
    }
  } else if (location.pathname === '/app/settings') {
    pageTitle = 'Settings';
    pageCount = 'Storage and preferences';
  } else if (location.pathname.startsWith('/app/f/')) {
    pageTitle = 'File detail';
    pageCount = 'Markdown preview';
  }

  return (
    <header className="px-6 sm:px-8 py-5 border-b border-[rgba(248,247,230,0.2)] bg-transparent flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Title & Small Count */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-cream border border-[rgba(248,247,230,0.3)] bg-transparent hover:bg-[rgba(248,247,230,0.15)] cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-cream tracking-tight leading-none">
            {pageTitle}
          </h1>
          <p className="text-xs text-cream/75 font-sans mt-1">
            {pageCount}
          </p>
        </div>
      </div>

      {/* Controls & Actions */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {/* Search Field (same oat paper as cards, ink magnifier, visible 70% placeholder, darker oat chip for "/" hint) */}
        <div className="relative flex-1 sm:w-64 md:w-72">
          <div className="relative flex items-center bg-[#D8D3BC] border border-[rgba(38,51,42,0.25)] rounded-xl px-3 py-2 text-xs shadow-xs focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/30 transition-all">
            <Search className="w-4 h-4 text-ink shrink-0 mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your stash"
              className="w-full bg-transparent text-ink placeholder:text-ink/70 focus:outline-none text-xs font-sans font-medium"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-ink/70 hover:text-ink ml-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 rounded border border-[rgba(38,51,42,0.25)] bg-[#CBC5AC] font-mono text-[10px] text-ink font-semibold shadow-xs pointer-events-none">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* View Mode Toggle (oat paper container, both icons clearly visible in ink, active orange chip with ink icon) */}
        <div className="flex items-center p-0.5 bg-[#D8D3BC] border border-[rgba(38,51,42,0.25)] rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-orange text-ink font-bold shadow-xs'
                : 'text-ink/80 hover:text-ink'
            }`}
            title="Grid view"
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4 text-ink" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-orange text-ink font-bold shadow-xs'
                : 'text-ink/80 hover:text-ink'
            }`}
            title="List view"
            aria-label="List view"
          >
            <List className="w-4 h-4 text-ink" />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".md,.markdown,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Import Button (oat paper chip with ink text & icon, >= 4.5:1 text, >= 3:1 icon) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2 rounded-xl border border-[rgba(38,51,42,0.25)] bg-[#D8D3BC] hover:bg-[#E2DEC9] hover:border-orange text-ink font-display text-xs tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Upload className="w-3.5 h-3.5 text-ink" />
          <span>Import</span>
        </button>

        {/* "Stash a note" (solid orange pill, NO icon inside pill per rules) */}
        <button
          type="button"
          onClick={onNewFile}
          className="px-5 py-2 rounded-full bg-orange hover:bg-orange-deep text-forest font-display text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
        >
          Stash a note
        </button>

        {/* Settings button (oat paper chip with ink icon, >= 3:1 icon contrast) */}
        <Link
          to="/app/settings"
          className="p-2 rounded-xl text-ink hover:text-forest border border-[rgba(38,51,42,0.25)] bg-[#D8D3BC] hover:bg-[#E2DEC9] transition-colors cursor-pointer shrink-0"
          title="Settings"
          aria-label="Settings"
        >
          <SettingsIcon className="w-4 h-4 text-ink" />
        </Link>
      </div>
    </header>
  );
};
