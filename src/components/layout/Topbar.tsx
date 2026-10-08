import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { importFilesList } from '../../services/fileImport';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  Upload,
  Settings as SettingsIcon,
  X,
  FileCode,
  Menu,
} from 'lucide-react';

interface TopbarProps {
  onNewFile: () => void;
  onToggleMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onNewFile, onToggleMobileMenu }) => {
  const {
    searchQuery,
    setSearchQuery,
    activeTag,
    setActiveTag,
    viewMode,
    setViewMode,
    showToast,
  } = useUIStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const res = await importFilesList(filesArray);
      showToast(`Imported ${res.added} file(s) (${res.skipped} skipped)`, 'success');
      e.target.value = '';
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 border-b border-line bg-forest/80 backdrop-blur-md flex items-center justify-between gap-3 sm:gap-4 sticky top-0 z-30">
      {/* Mobile hamburger menu */}
      {onToggleMobileMenu && (
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-cream-dim hover:text-cream border border-line bg-forest cursor-pointer shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      )}

      {/* Search Bar */}
      <div className="flex-1 max-w-md relative flex items-center gap-2">
        <div className="w-full relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search markdown by title, tag, or content..."
            icon={<Search className="w-4 h-4 text-cream-dim" />}
            className="bg-forest-dark border-line text-xs pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cream-dim hover:text-cream cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {activeTag && (
          <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-orange/20 text-orange border border-orange/40">
            <span>#{activeTag}</span>
            <button
              onClick={() => setActiveTag(null)}
              className="hover:opacity-75 cursor-pointer"
            >
              ×
            </button>
          </span>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* View mode toggle */}
        <div className="hidden sm:flex items-center p-1 bg-forest-dark border border-line rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-orange text-forest shadow-sm'
                : 'text-cream-dim hover:text-cream'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-orange text-forest shadow-sm'
                : 'text-cream-dim hover:text-cream'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
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

        {/* Import file picker */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          icon={<Upload className="w-4 h-4" />}
          className="hidden sm:inline-flex"
        >
          Import
        </Button>

        {/* New note button */}
        <Button
          size="sm"
          variant="primary"
          onClick={onNewFile}
          icon={<Plus className="w-4 h-4" />}
        >
          Stash Note
        </Button>

        {/* Settings button */}
        <Link
          to="/app/settings"
          className="p-2 rounded-lg text-cream-dim hover:text-cream hover:bg-cream-faint border border-line transition-colors cursor-pointer"
          title="Storage & Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
};
