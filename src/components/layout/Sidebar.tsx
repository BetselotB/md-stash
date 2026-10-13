import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Logo } from '../ui/Logo';
import { useCollections, useFiles, usePinnedFiles, useAllTags, useComponents } from '../../hooks/useDb';
import { filesRepo } from '../../db/files.repo';
import { collectionsRepo } from '../../db/collections.repo';
import { persistenceService } from '../../services/persistence';
import { importExportService } from '../../services/importExport';
import { getFilesFromDataTransfer, importFiles } from '../../services/fileImport';
import { useUIStore } from '../../store/uiStore';
import { Collection } from '../../domain/types';
import { CrateGlyph } from '../ui/CrateGlyph';
import {
  Files,
  Inbox,
  Pin,
  Plus,
  Edit2,
  HardDrive,
  Download,
  ChevronRight,
  X,
  Cloud,
  LogIn,
  LogOut,
  RefreshCw,
  Layers,
  Cpu,
} from 'lucide-react';
import { useSync } from '../../hooks/useSync';
import { AuthModal } from '../auth/AuthModal';

interface SidebarProps {
  onNewCollection: () => void;
  onEditCollection: (c: Collection) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface SortableCollectionRowProps {
  collection: Collection;
  count: number;
  isCurrent: boolean;
  isHoveredDrop: boolean;
  isDropped: boolean;
  isDraggingCard: boolean;
  onEdit: (c: Collection) => void;
  onSelect: (id: string) => void;
  onDragOverCol: (e: React.DragEvent, id: string) => void;
  onDragLeaveCol: (e: React.DragEvent, id: string) => void;
  onDropCol: (e: React.DragEvent, id: string) => void;
}

const SortableCollectionRow: React.FC<SortableCollectionRowProps> = ({
  collection,
  count,
  isCurrent,
  isHoveredDrop,
  isDropped,
  isDraggingCard,
  onEdit,
  onSelect,
  onDragOverCol,
  onDragLeaveCol,
  onDropCol,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over,
  } = useSortable({ id: collection.id });

  const style: React.CSSProperties = {
    transform: isDragging || transform ? CSS.Translate.toString(transform) : undefined,
    transition: isDragging || transform ? transition : undefined,
  };

  const isInsertionTarget = over?.id === collection.id && !isDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDragOver={(e) => onDragOverCol(e, collection.id)}
      onDragLeave={(e) => onDragLeaveCol(e, collection.id)}
      onDrop={(e) => onDropCol(e, collection.id)}
      onClick={() => onSelect(collection.id)}
      className={`group relative flex items-center justify-between px-3 h-9 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
        isDragging ? 'opacity-40 z-20 scale-[0.98]' : ''
      } ${
        isCurrent
          ? 'bg-cream text-ink shadow-sm'
          : 'text-cream hover:bg-[rgba(248,247,230,0.14)]'
      } ${
        isDraggingCard
          ? 'border border-dashed border-[rgba(248,247,230,0.5)]'
          : 'border border-transparent'
      } ${
        isHoveredDrop
          ? 'bg-[rgba(248,247,230,0.3)] !border-orange !border-dashed'
          : ''
      } ${isDropped ? 'animate-thunk' : ''}`}
    >
      {/* Thin orange insertion line showing drop target */}
      {isInsertionTarget && (
        <div className="absolute -top-1 inset-x-2 h-0.5 bg-orange rounded-full pointer-events-none z-30 shadow-[0_0_4px_rgba(238,178,87,0.8)]" />
      )}

      <div className="flex items-center gap-2.5 truncate min-w-0">
        {/* Small flat matte crate glyph tinted in collection color */}
        <CrateGlyph
          color={collection.color}
          isOpen={isHoveredDrop}
          size={18}
        />
        <span className="truncate tracking-tight font-sans text-[12.5px]">
          {collection.name}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 h-5">
        {/* Count badge */}
        <span
          className={`text-[11px] font-mono px-1.5 h-5 flex items-center justify-center rounded font-medium transition-colors ${
            isCurrent
              ? 'bg-[rgba(38,51,42,0.12)] text-ink'
              : 'bg-[rgba(38,51,42,0.1)] text-cream group-hover:hidden'
          }`}
        >
          {count}
        </span>

        {/* Edit pencil button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(collection);
          }}
          className={`w-5 h-5 flex items-center justify-center rounded transition-colors cursor-pointer ${
            isCurrent
              ? 'text-ink/70 hover:bg-orange hover:text-ink focus-visible:bg-orange focus-visible:text-ink'
              : 'hidden group-hover:flex text-cream hover:bg-orange hover:text-ink focus-visible:bg-orange focus-visible:text-ink'
          }`}
          title="Edit collection"
          aria-label="Edit collection"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

let hasLoadedSidebarOnce = false;

export const Sidebar: React.FC<SidebarProps> = ({
  onNewCollection,
  onEditCollection,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const { collectionId: activeCollectionId } = useParams<{ collectionId?: string }>();
  const [searchParams] = useSearchParams();
  const isPinnedFilter = searchParams.get('filter') === 'pinned';

  const collections = useCollections();
  const allFiles = useFiles();
  const allComponents = useComponents();
  const pinnedFiles = usePinnedFiles();
  const tags = useAllTags();
  const { activeTag, setActiveTag, showToast, isDraggingCard, setIsDraggingCard } = useUIStore();
  const { user, status: syncStatus, syncNow, signOut } = useSync();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [persisted, setPersisted] = useState(false);
  const [usageBytes, setUsageBytes] = useState(0);
  const [quotaBytes, setQuotaBytes] = useState(0);
  const [hoveredDropId, setHoveredDropId] = useState<string | null>(null);
  const [droppingColId, setDroppingColId] = useState<string | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(!hasLoadedSidebarOnce);

  // DnD-kit sensors with 5px distance constraint to preserve click navigation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!hasLoadedSidebarOnce) {
      hasLoadedSidebarOnce = true;
      const t = setTimeout(() => setIsInitialMount(false), 800);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    persistenceService.getQuota().then((info) => {
      setPersisted(info.persisted);
      setUsageBytes(info.usage);
      setQuotaBytes(info.quota);
    });
  }, [allFiles.length]);

  const unsortedFiles = allFiles.filter((f) => f.collectionId === null);

  const handleCollectionDrop = async (e: React.DragEvent, colId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredDropId(null);
    setIsDraggingCard(false);

    const plainText = e.dataTransfer.getData('text/plain');
    const customId = e.dataTransfer.getData('application/x-mdstash-file');
    const matchingFile = customId
      ? allFiles.find((f) => f.id === customId)
      : allFiles.find((f) => f.content === plainText);

    if (matchingFile) {
      setDroppingColId(colId || '__unsorted');
      setTimeout(() => setDroppingColId(null), 400);

      await filesRepo.moveToCollection(matchingFile.id, colId);
      const targetCol = collections.find((c) => c.id === colId);
      showToast(
        `Moved "${matchingFile.filename}" to ${targetCol ? targetCol.name : 'Unsorted'}`,
        'success'
      );
    } else {
      try {
        const files = await getFilesFromDataTransfer(e.dataTransfer.items || e.dataTransfer.files);
        if (files.length > 0) {
          setDroppingColId(colId || '__unsorted');
          setTimeout(() => setDroppingColId(null), 400);
          const result = await importFiles(files, { collectionId: colId });
          showToast(result.message, result.added > 0 ? 'success' : 'info');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to import dropped files', 'error');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (hoveredDropId !== targetId) {
      setHoveredDropId(targetId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, targetId: string) => {
    if (hoveredDropId === targetId) {
      setHoveredDropId(null);
    }
  };

  const handleBackupExport = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await importExportService.exportZip(allFiles, collections);
      showToast('Exported backup zip archive!', 'success');
    } catch {
      showToast('Failed to export backup', 'error');
    }
  };

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const handleSortEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = collections.findIndex((c) => c.id === active.id);
      const newIndex = collections.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newCols = arrayMove(collections, oldIndex, newIndex);
        await collectionsRepo.reorder(newCols.map((c) => c.id));
      }
    }
  };

  // Used / Quota ratio
  const usageRatio = quotaBytes > 0 ? usageBytes / quotaBytes : 0;
  const visualFillPercent = Math.min(100, Math.max(usageBytes > 0 ? 8 : 2, Math.round(usageRatio * 100)));

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-forest-dark/80 backdrop-blur-sm md:hidden animate-fadeIn"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Aside in deep sage */}
      <aside
        data-lenis-prevent
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 md:static md:flex flex-col justify-between shrink-0 h-screen select-none border-r border-[rgba(248,247,230,0.22)] bg-sage-deep text-cream transition-transform duration-200 ease-in-out ${
          isInitialMount ? 'animate-sidebar-slide' : ''
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand header: bigger logo (40px mark, 34px wordmark), aligned with sidebar left padding */}
          <div className="px-5 py-6 border-b border-[rgba(248,247,230,0.18)] flex items-center justify-between">
            <NavLink
              to="/"
              onClick={handleNavClick}
              className="group flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-orange rounded-lg"
            >
              <Logo size="sidebar" />
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
              {/* Components Library */}
              <NavLink
                to="/app"
                end
                onClick={handleNavClick}
                className={({ isActive }) => {
                  const current = isActive && !activeCollectionId && !isPinnedFilter;
                  return `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    current
                      ? 'bg-cream text-ink shadow-sm'
                      : 'text-cream hover:bg-[rgba(248,247,230,0.12)]'
                  } ${
                    isDraggingCard
                      ? 'border border-dashed border-[rgba(248,247,230,0.45)]'
                      : 'border border-transparent'
                  }`;
                }}
                onDragOver={(e) => handleDragOver(e, '__all')}
                onDragLeave={(e) => handleDragLeave(e, '__all')}
                onDrop={(e) => handleCollectionDrop(e, null)}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 stroke-[1.75] shrink-0" />
                  <span className="tracking-tight text-[13px]">Components</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[rgba(38,51,42,0.1)] text-inherit font-semibold">
                  {allComponents.length}
                </span>
              </NavLink>

              {/* Docs & Rules (Notes) */}
              <NavLink
                to="/app/docs"
                onClick={handleNavClick}
                className={({ isActive }) => {
                  return `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-cream text-ink shadow-sm'
                      : 'text-cream hover:bg-[rgba(248,247,230,0.12)]'
                  }`;
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Files className="w-5 h-5 stroke-[1.75] shrink-0" />
                  <span className="tracking-tight text-[13px]">Docs & Rules</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[rgba(38,51,42,0.1)] text-inherit font-semibold">
                  {allFiles.length}
                </span>
              </NavLink>

              {/* Pinned */}
              <NavLink
                to="/app?filter=pinned"
                onClick={handleNavClick}
                className={() =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isPinnedFilter
                      ? 'bg-cream text-ink shadow-sm'
                      : 'text-cream hover:bg-[rgba(248,247,230,0.12)]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Pin className="w-5 h-5 stroke-[1.75] shrink-0" />
                  <span className="tracking-tight text-[13px]">Pinned</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[rgba(38,51,42,0.1)] text-inherit font-semibold">
                  {pinnedFiles.length}
                </span>
              </NavLink>

              {/* Agent Inbox */}
              <NavLink
                to="/app/inbox"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-cream text-ink shadow-sm'
                      : 'text-cream hover:bg-[rgba(248,247,230,0.12)]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-5 h-5 stroke-[1.75] shrink-0 text-orange" />
                  <span className="tracking-tight text-[13px]">Agent Inbox</span>
                </div>
              </NavLink>

              {/* Agent Access & Connect */}
              <NavLink
                to="/app/connect"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-cream text-ink shadow-sm'
                      : 'text-cream hover:bg-[rgba(248,247,230,0.12)]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-5 h-5 stroke-[1.75] shrink-0 text-orange" />
                  <span className="tracking-tight text-[13px]">Agent Access</span>
                </div>
              </NavLink>

              {/* Add Component */}
              <NavLink
                to="/app/add"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-cream text-ink shadow-sm'
                      : 'text-cream hover:bg-[rgba(248,247,230,0.12)]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-5 h-5 stroke-[2] shrink-0 text-orange" />
                  <span className="tracking-tight text-[13px]">Add Component</span>
                </div>
              </NavLink>

              {/* Unsorted */}
              <NavLink
                to="/app/col/unsorted"
                onClick={handleNavClick}
                className={({ isActive }) => {
                  const isHovered = hoveredDropId === '__unsorted';
                  const isDropped = droppingColId === '__unsorted';
                  return `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-cream text-ink shadow-sm'
                      : 'text-cream hover:bg-[rgba(248,247,230,0.12)]'
                  } ${
                    isDraggingCard
                      ? 'border border-dashed border-[rgba(248,247,230,0.45)]'
                      : 'border border-transparent'
                  } ${isHovered ? 'bg-[rgba(248,247,230,0.25)] border-orange' : ''} ${
                    isDropped ? 'animate-thunk' : ''
                  }`;
                }}
                onDragOver={(e) => handleDragOver(e, '__unsorted')}
                onDragLeave={(e) => handleDragLeave(e, '__unsorted')}
                onDrop={(e) => handleCollectionDrop(e, null)}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-5 h-5 stroke-[1.75] shrink-0" />
                  <span className="tracking-tight text-[13px]">Unsorted</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[rgba(38,51,42,0.1)] text-inherit font-semibold">
                  {unsortedFiles.length}
                </span>
              </NavLink>
            </div>

            {/* Collections List with DnD-kit sortable drag reordering */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-xs font-bold tracking-tight text-cream/90 font-display">
                  Collections
                </span>
                <button
                  type="button"
                  onClick={onNewCollection}
                  className="p-1 rounded-md text-cream hover:text-orange hover:bg-[rgba(248,247,230,0.15)] transition-colors cursor-pointer"
                  title="New collection"
                  aria-label="New collection"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {collections.length === 0 ? (
                  <p className="text-xs text-cream/60 px-3 py-1 italic font-sans">
                    No collections yet.
                  </p>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSortEnd}
                  >
                    <SortableContext
                      items={collections.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {collections.map((col) => {
                        const count = allFiles.filter((f) => f.collectionId === col.id).length;
                        const isCurrent = activeCollectionId === col.id;
                        const isHovered = hoveredDropId === col.id;
                        const isDropped = droppingColId === col.id;

                        return (
                          <SortableCollectionRow
                            key={col.id}
                            collection={col}
                            count={count}
                            isCurrent={isCurrent}
                            isHoveredDrop={isHovered}
                            isDropped={isDropped}
                            isDraggingCard={isDraggingCard}
                            onEdit={onEditCollection}
                            onSelect={(id) => {
                              navigate(`/app/col/${id}`);
                              handleNavClick();
                            }}
                            onDragOverCol={handleDragOver}
                            onDragLeaveCol={handleDragLeave}
                            onDropCol={handleCollectionDrop}
                          />
                        );
                      })}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <div className="px-2 mb-2">
                  <span className="text-xs font-bold tracking-tight text-cream/90 font-display">
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
                      className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium tracking-tight ${
                        activeTag === t
                          ? 'bg-cream text-ink font-bold shadow-sm'
                          : 'bg-[rgba(248,247,230,0.15)] text-cream hover:bg-cream hover:text-ink'
                      }`}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Cloud Sync & Storage Area */}
          <div className="p-3.5 border-t border-[rgba(248,247,230,0.18)] bg-sage-deep">
            {/* Cloud Sync Account Card */}
            <div className="p-3 rounded-2xl bg-[rgba(248,247,230,0.1)] border border-[rgba(248,247,230,0.2)] flex flex-col gap-2 mb-2.5">
              {!user ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-orange" />
                      <span className="text-xs font-display text-cream font-bold">Cloud Sync</span>
                    </div>
                    <span className="text-[10px] font-mono text-cream/60">Offline</span>
                  </div>
                  <p className="text-[11px] text-cream/70 font-sans leading-tight">
                    Sync your stash across computers in real-time.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full py-1.5 px-3 rounded-xl bg-orange hover:bg-orange-deep text-forest font-display text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5 text-forest" />
                    <span>Sign In to Sync</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative shrink-0">
                        <Cloud className="w-4 h-4 text-orange" />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-sage-deep ${
                            syncStatus === 'synced'
                              ? 'bg-emerald-400'
                              : syncStatus === 'syncing'
                              ? 'bg-yellow-400 animate-pulse'
                              : 'bg-red-400'
                          }`}
                        />
                      </div>
                      <span
                        className="text-xs font-display text-cream font-bold truncate max-w-[130px]"
                        title={user.email || ''}
                      >
                        {user.email}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cream/70">
                      {syncStatus === 'synced'
                        ? 'Synced'
                        : syncStatus === 'syncing'
                        ? 'Syncing'
                        : 'Alert'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[rgba(248,247,230,0.12)]">
                    <button
                      type="button"
                      onClick={() => {
                        syncNow().then(() => showToast('Sync complete', 'success')).catch(() => showToast('Sync error', 'error'));
                      }}
                      disabled={syncStatus === 'syncing'}
                      className="py-1 px-2.5 rounded-lg border border-cream/50 hover:border-orange text-cream hover:text-orange text-[11px] font-display flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Sync now"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      <span>Sync</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        signOut().then(() => showToast('Signed out of cloud sync', 'info'));
                      }}
                      className="py-1 px-2 rounded-lg text-cream/70 hover:text-red-300 hover:bg-red-500/20 text-[11px] font-display flex items-center gap-1 transition-colors cursor-pointer"
                      title="Sign out"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Storage Crate Card */}
            <div className="p-3 rounded-2xl bg-[rgba(248,247,230,0.1)] border border-[rgba(248,247,230,0.2)] flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Small storage crate glyph with visual fill */}
                  <div className="relative w-8 h-8 rounded-lg bg-[rgba(38,51,42,0.25)] border border-[rgba(248,247,230,0.28)] flex items-end justify-center overflow-hidden shrink-0">
                    <div
                      className="w-full bg-orange transition-all duration-300"
                      style={{ height: `${visualFillPercent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <HardDrive className="w-4 h-4 text-cream/90" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-cream font-display leading-tight">
                      Storage
                    </div>
                    <div className="text-[10.5px] font-mono text-cream/80 truncate">
                      {persistenceService.formatBytes(usageBytes)} /{' '}
                      {quotaBytes > 0 ? persistenceService.formatBytes(quotaBytes) : 'Quota'}
                    </div>
                  </div>
                </div>

                {persisted && (
                  <span className="text-[11px] font-display text-orange shrink-0">
                    Persisted
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-[rgba(248,247,230,0.14)]">
                <button
                  type="button"
                  onClick={handleBackupExport}
                  className="flex-1 py-1.5 px-3 rounded-xl border border-cream/70 hover:border-orange text-cream hover:text-orange hover:bg-orange/10 font-display text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title="Export zip backup"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Back up</span>
                </button>

                <NavLink
                  to="/app/settings"
                  onClick={handleNavClick}
                  className="p-1.5 rounded-lg text-cream/80 hover:text-cream hover:bg-[rgba(248,247,230,0.15)] transition-colors cursor-pointer"
                  title="Storage settings"
                  aria-label="Storage settings"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
