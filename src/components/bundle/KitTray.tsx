import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useComponents } from '../../hooks/useDb';
import { componentsRepo } from '../../db/components.repo';
import { collectionsRepo } from '../../db/collections.repo';
import {
  formatCopyKitPrompt,
  formatCopyInstall,
  createComponentZipBuffer,
  ModelPreset,
} from '../../services/copyEngine';
import { CodeBlob } from '../../domain/componentTypes';
import {
  Layers,
  Copy,
  Download,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ListOrdered,
  Sparkles,
  Terminal,
  FolderPlus,
} from 'lucide-react';

type KitAction = 'prompt' | 'install' | 'zip' | 'save';

export const KitTray: React.FC = () => {
  const {
    selectedComponentIds,
    clearComponentSelection,
    reorderSelectedComponents,
    showToast,
  } = useUIStore();

  const allComponents = useComponents();
  const [currentAction, setCurrentAction] = useState<KitAction>('prompt');
  const [isCopied, setIsCopied] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [kitTitle, setKitTitle] = useState('My Custom Kit');

  if (selectedComponentIds.length < 1) return null;

  // Selected components preserving current order
  const selectedComponents = selectedComponentIds
    .map((id) => allComponents.find((c) => c.id === id))
    .filter(Boolean) as typeof allComponents;

  // Load code blobs helper
  const loadSelectedBlobs = async (): Promise<Map<string, CodeBlob>> => {
    const map = new Map<string, CodeBlob>();
    for (const comp of selectedComponents) {
      let b = await componentsRepo.getCodeBlob(comp.id);
      if (!b) {
        try {
          const res = await fetch(`/r/${comp.id}.json`);
          if (res.ok) {
            const item = await res.json();
            b = {
              id: comp.id,
              code: item.files?.[0]?.content || '',
              props: [],
              deps: item.dependencies || [],
              dependsOn: item.registryDependencies || [],
              shared: ['utils/cn'],
            };
          }
        } catch {
          // fallback
        }
      }
      if (b) map.set(comp.id, b);
    }
    return map;
  };

  // Handle Copy Prompt Bundle
  const handleCopyPromptBundle = async () => {
    try {
      const blobs = await loadSelectedBlobs();
      const text = formatCopyKitPrompt(selectedComponents, blobs, kitTitle, {
        modelPreset: 'claude',
      });
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      showToast(`Copied kit prompt bundle (${selectedComponents.length} components)!`, 'success');
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      showToast('Failed to copy kit prompt', 'error');
    }
  };

  // Handle Copy Install Script
  const handleCopyInstallScript = async () => {
    try {
      const blobs = await loadSelectedBlobs();
      const scripts = selectedComponents.map((c) => {
        const b = blobs.get(c.id);
        const { fullScript } = formatCopyInstall(c, b, { pkgManager: 'pnpm' });
        return fullScript;
      });
      const combined = `#!/bin/bash\n# Install Kit: ${kitTitle}\n\n` + scripts.join('\n\n');
      await navigator.clipboard.writeText(combined);
      setIsCopied(true);
      showToast('Copied install commands for kit!', 'success');
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      showToast('Failed to copy install commands', 'error');
    }
  };

  // Handle Download Zip Archive
  const handleDownloadZip = async () => {
    try {
      const blobs = await loadSelectedBlobs();
      const zipBuffer = createComponentZipBuffer(selectedComponents, blobs, kitTitle);
      const blob = new Blob([zipBuffer as any], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `mdstash-kit-${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded kit zip archive!', 'success');
    } catch {
      showToast('Failed to generate zip archive', 'error');
    }
  };

  // Handle Save as Collection / Kit
  const handleSaveAsKit = async () => {
    try {
      const col = await collectionsRepo.create({
        name: kitTitle,
        color: 'var(--orange)',
        icon: 'crate',
        order: 0,
      });
      showToast(`Saved as kit "${kitTitle}"!`, 'success');
    } catch {
      showToast('Failed to save kit', 'error');
    }
  };

  // Trigger Primary Action
  const handlePrimaryAction = () => {
    switch (currentAction) {
      case 'prompt':
        return handleCopyPromptBundle();
      case 'install':
        return handleCopyInstallScript();
      case 'zip':
        return handleDownloadZip();
      case 'save':
        return handleSaveAsKit();
    }
  };

  return (
    <div
      data-lenis-prevent
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] min-w-[640px] max-w-[920px] animate-slideUp select-none"
    >
      <div className="relative flex flex-col bg-[#D8D3BC] text-ink border border-[rgba(38,51,42,0.22)] rounded-3xl shadow-[0_16px_36px_-6px_rgba(38,51,42,0.28)] overflow-hidden focus-within:ring-2 focus-within:ring-orange/80">
        {/* Paper grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-paper-grain rounded-3xl opacity-40"
          aria-hidden="true"
        />

        {/* Main Action Bar */}
        <div className="relative z-10 flex flex-row items-center justify-between gap-4 px-5 py-3.5">
          {/* Title and Count */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-[rgba(38,51,42,0.08)] border border-[rgba(38,51,42,0.16)] flex items-center justify-center text-ink shrink-0">
              <Layers className="w-5 h-5 text-orange-deep" />
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <input
                type="text"
                value={kitTitle}
                onChange={(e) => setKitTitle(e.target.value)}
                className="font-display text-sm font-bold tracking-tight text-ink bg-transparent border-b border-transparent hover:border-orange focus:border-orange focus:outline-none px-1 py-0.5"
                title="Click to rename kit"
              />
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange text-forest font-mono font-bold whitespace-nowrap shadow-xs">
                {selectedComponents.length} components
              </span>
            </div>
          </div>

          {/* Action Selector & Buttons */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Reorder Toggle */}
            <button
              type="button"
              onClick={() => setIsReordering(!isReordering)}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                isReordering
                  ? 'border-orange bg-orange text-forest font-bold shadow-xs'
                  : 'border-[rgba(38,51,42,0.22)] text-ink/75 hover:text-ink hover:bg-[rgba(38,51,42,0.08)]'
              }`}
              title="Reorder components"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Action Segmented Switcher */}
            <div className="flex items-center bg-[rgba(38,51,42,0.08)] p-1 rounded-2xl border border-[rgba(38,51,42,0.12)]">
              {(
                [
                  { id: 'prompt', label: 'Prompt', icon: Sparkles },
                  { id: 'install', label: 'Install', icon: Terminal },
                  { id: 'zip', label: 'Zip', icon: Download },
                  { id: 'save', label: 'Save Kit', icon: FolderPlus },
                ] as const
              ).map((act) => {
                const Icon = act.icon;
                const isActive = currentAction === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setCurrentAction(act.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-forest text-cream font-bold shadow-xs'
                        : 'text-ink/70 hover:text-ink'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="px-4 py-2 rounded-2xl bg-orange hover:bg-orange-deep text-forest font-display text-xs font-bold tracking-wide shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-forest stroke-[2.5]" />
              ) : currentAction === 'zip' ? (
                <Download className="w-4 h-4" />
              ) : currentAction === 'save' ? (
                <FolderPlus className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>
                {isCopied
                  ? 'Copied!'
                  : currentAction === 'prompt'
                  ? 'Copy Prompt Bundle'
                  : currentAction === 'install'
                  ? 'Copy Install Script'
                  : currentAction === 'zip'
                  ? 'Download Zip'
                  : 'Save Kit'}
              </span>
            </button>

            {/* Close / Clear Selection */}
            <button
              type="button"
              onClick={clearComponentSelection}
              className="p-1.5 rounded-full text-ink/75 hover:text-ink hover:bg-[rgba(38,51,42,0.1)] transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Reorder List */}
        {isReordering && (
          <div className="relative z-10 px-5 py-3 border-t border-[rgba(38,51,42,0.16)] bg-[#CEC9B2] space-y-2 max-h-52 overflow-y-auto">
            <div className="text-[11px] font-semibold text-ink/75 tracking-tight font-display">
              Order of components in kit bundle:
            </div>
            {selectedComponents.map((c, idx) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#D8D3BC] border border-[rgba(38,51,42,0.16)] text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-orange font-bold">{idx + 1}.</span>
                  <span className="font-bold text-ink truncate">{c.name}</span>
                  <span className="font-mono text-ink/60 text-[11px]">({c.category})</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => reorderSelectedComponents(idx, idx - 1)}
                    className="p-1 text-ink/60 hover:text-ink disabled:opacity-20 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === selectedComponents.length - 1}
                    onClick={() => reorderSelectedComponents(idx, idx + 1)}
                    className="p-1 text-ink/60 hover:text-ink disabled:opacity-20 cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
