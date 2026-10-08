import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { useCollections, useFiles, usePinnedFiles, useAllTags } from '../../hooks/useDb';
import { filesRepo } from '../../db/files.repo';
import { collectionsRepo } from '../../db/collections.repo';
import { persistenceService } from '../../services/persistence';
import { useUIStore } from '../../store/uiStore';
import { Collection } from '../../domain/types';
import {
  Folder,
  Bookmark,
  Code,
  Terminal,
  Sparkles,
  Compass,
  Tag as TagIcon,
  Files,
  Pin,
  Inbox,
  Plus,
  Edit2,
  HardDrive,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  onNewCollection: () => void;
  onEditCollection: (c: Collection) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  folder: Folder,
  bookmark: Bookmark,
  code: Code,
  terminal: Terminal,
  sparkles: Sparkles,
  compass: Compass,
  tag: TagIcon,
};

export const Sidebar: React.FC<SidebarProps> = ({
  onNewCollection,
  onEditCollection,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const { collectionId: activeCollectionId } = useParams<{ collectionId?: string }>();
  const collections = useCollections();
  const allFiles = useFiles();
  const pinnedFiles = usePinnedFiles();
  const tags = useAllTags();
  const { activeTag, setActiveTag, showToast } = useUIStore();

  const [persisted, setPersisted] = useState(false);
  const [quotaUsage, setQuotaUsage] = useState<string>('0 B');

  useEffect(() => {
    persistenceService.getQuota().then((info) => {
      setPersisted(info.persisted);
      setQuotaUsage(persistenceService.formatBytes(info.usage));
    });
  }, [allFiles.length]);

  const unsortedFiles = allFiles.filter((f) => f.collectionId === null);

  const handleCollectionDrop = async (e: React.DragEvent, colId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    const plainText = e.dataTransfer.getData('text/plain');
    const matchingFile = allFiles.find((f) => f.content === plainText);
    if (matchingFile) {
      await filesRepo.moveToCollection(matchingFile.id, colId);
      showToast(`Moved "${matchingFile.filename}" to collection`, 'success');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-forest-dark/80 backdrop-blur-sm md:hidden animate-fadeIn"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        data-lenis-prevent
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 md:static md:flex flex-col justify-between shrink-0 h-screen select-none border-r border-line bg-forest-dark transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand header */}
          <div className="p-5 border-b border-line flex items-center justify-between">
            <NavLink to="/" onClick={handleNavClick} className="group flex items-center gap-2">
              <Logo size="sm" />
            </NavLink>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-cream-dim hover:text-cream cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              <NavLink
                to="/app"
                end
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isActive && !activeCollectionId
                      ? 'bg-pink text-forest shadow-sm'
                      : 'text-cream-dim hover:text-cream hover:bg-forest'
                  }`
                }
                onDragOver={handleDragOver}
                onDrop={(e) => handleCollectionDrop(e, null)}
              >
                <div className="flex items-center gap-2.5">
                  <Files className="w-4 h-4" />
                  <span>All Files</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">{allFiles.length}</span>
              </NavLink>

              <NavLink
                to="/app?filter=pinned"
                onClick={handleNavClick}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-cream-dim hover:text-cream hover:bg-forest transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Pin className="w-4 h-4 text-pink" />
                  <span>Pinned Favorites</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">{pinnedFiles.length}</span>
              </NavLink>

              <NavLink
                to="/app/c/unsorted"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-pink text-forest shadow-sm'
                      : 'text-cream-dim hover:text-cream hover:bg-forest'
                  }`
                }
                onDragOver={handleDragOver}
                onDrop={(e) => handleCollectionDrop(e, null)}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4" />
                  <span>Unsorted</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">{unsortedFiles.length}</span>
              </NavLink>
            </div>

            {/* Collections List */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cream-dim/70">
                  Collections
                </span>
                <button
                  type="button"
                  onClick={onNewCollection}
                  className="p-1 rounded-md text-cream-dim hover:text-pink hover:bg-forest transition-colors cursor-pointer"
                  title="New Collection"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {collections.length === 0 ? (
                  <p className="text-xs text-cream-dim/50 px-3 py-1 italic">
                    No collections yet.
                  </p>
                ) : (
                  collections.map((col, idx) => {
                    const IconComp = ICON_MAP[col.icon] || Folder;
                    const count = allFiles.filter((f) => f.collectionId === col.id).length;
                    const isCurrent = activeCollectionId === col.id;

                    return (
                      <div
                        key={col.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleCollectionDrop(e, col.id)}
                        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-forest border border-pink text-cream'
                            : 'text-cream-dim hover:text-cream hover:bg-forest border border-transparent'
                        }`}
                        onClick={() => {
                          navigate(`/app/c/${col.id}`);
                          handleNavClick();
                        }}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: col.color }}
                          />
                          <IconComp className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{col.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-mono opacity-70 group-hover:hidden">
                            {count}
                          </span>
                          <div className="hidden group-hover:flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newCols = [...collections];
                                const [removed] = newCols.splice(idx, 1);
                                newCols.splice(idx - 1, 0, removed);
                                collectionsRepo.reorder(newCols.map((c) => c.id));
                              }}
                              className="p-1 text-cream-dim hover:text-cream disabled:opacity-20 transition-colors"
                              title="Move up"
                            >
                              <span className="text-[10px]">▲</span>
                            </button>
                            <button
                              type="button"
                              disabled={idx === collections.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newCols = [...collections];
                                const [removed] = newCols.splice(idx, 1);
                                newCols.splice(idx + 1, 0, removed);
                                collectionsRepo.reorder(newCols.map((c) => c.id));
                              }}
                              className="p-1 text-cream-dim hover:text-cream disabled:opacity-20 transition-colors"
                              title="Move down"
                            >
                              <span className="text-[10px]">▼</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditCollection(col);
                              }}
                              className="p-1 text-cream-dim hover:text-pink rounded transition-colors"
                              title="Edit collection"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <div className="px-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cream-dim/70">
                    Tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setActiveTag(activeTag === t ? null : t);
                        handleNavClick();
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        activeTag === t
                          ? 'bg-pink text-forest border-pink font-bold shadow-sm'
                          : 'bg-forest text-cream-dim border-line hover:text-cream hover:border-cream/40'
                      }`}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Persistence Badge */}
          <div className="p-4 border-t border-line bg-forest-dark/90">
            <NavLink
              to="/app/settings"
              onClick={handleNavClick}
              className="flex items-center justify-between p-2.5 rounded-xl bg-forest border border-line hover:border-pink/50 transition-colors text-xs text-cream"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-cream">Local-first Storage</div>
                  <div className="text-[10px] text-cream-dim font-mono">
                    {quotaUsage} • {persisted ? 'Persisted' : 'Default'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-cream-dim" />
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};
