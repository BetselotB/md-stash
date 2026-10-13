import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComponentMetadata } from '../../domain/componentTypes';
import { componentsRepo } from '../../db/components.repo';
import { useUIStore } from '../../store/uiStore';
import { PreviewSandbox } from '../preview/PreviewSandbox';
import { Pin, Copy, Sparkles, Plus, Check } from 'lucide-react';
import { getPreviewStatusInfo } from '../../services/previewRuntime';

interface ComponentCardProps {
  component: ComponentMetadata;
  index?: number;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ component, index = 0 }) => {
  const navigate = useNavigate();
  const { showToast, selectedComponentIds, toggleSelectComponent } = useUIStore();
  const [isHovered, setIsHovered] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isSelectedInKit = selectedComponentIds.includes(component.id);
  const statusInfo = getPreviewStatusInfo(component.previewStatus);

  // 300ms hover trigger for live sandbox iframe
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (component.previewStatus === 'ready') {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowLivePreview(true);
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Release live preview after brief delay on mouse leave to free up LRU slots
    setTimeout(() => {
      setShowLivePreview(false);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Favorite pushpin toggle
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await componentsRepo.setFavorite(component.id, !component.favorite);
      showToast(
        component.favorite ? `Unpinned ${component.name}` : `Pinned ${component.name}`,
        'info'
      );
    } catch {
      showToast('Failed to update favorite status', 'error');
    }
  };

  // Quick copy code
  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      let code = '';
      const blob = await componentsRepo.getCodeBlob(component.id);
      if (blob?.code) {
        code = blob.code;
      } else {
        const res = await fetch(`/r/${component.id}.json`);
        if (res.ok) {
          const item = await res.json();
          code = item.files?.[0]?.content || '';
        }
      }

      if (code) {
        await navigator.clipboard.writeText(code);
        setCopiedCode(true);
        showToast(`Copied code for ${component.name}`, 'success');
        setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch {
      showToast('Failed to copy code', 'error');
    }
  };

  // Quick copy prompt
  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const prompt = `Please implement the "${component.name}" component (${component.id}) from the MDstash library into my project using ${component.styling} and React.`;
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      showToast(`Copied AI prompt for ${component.name}`, 'success');
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      showToast('Failed to copy prompt', 'error');
    }
  };

  // Quick Add to Kit
  const handleAddToKit = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelectComponent(component.id);
    showToast(
      isSelectedInKit
        ? `Removed ${component.name} from kit`
        : `Added ${component.name} to kit tray`,
      'info'
    );
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      navigate(`/app/c/${component.id}`);
    } else if (e.key.toLowerCase() === 'c') {
      handleCopyCode(e as unknown as React.MouseEvent);
    } else if (e.key.toLowerCase() === 'p') {
      handleCopyPrompt(e as unknown as React.MouseEvent);
    }
  };

  return (
    <div
      role="article"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/app/c/${component.id}`)}
      className={`group relative flex flex-col rounded-2xl bg-[var(--dialog-bg)] border transition-all duration-200 cursor-pointer overflow-hidden text-ink select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
        isSelectedInKit
          ? 'border-orange ring-1 ring-orange shadow-md'
          : 'border-[rgba(38,51,42,0.18)] hover:border-orange hover:shadow-lg'
      }`}
      style={{
        animationDelay: `${Math.min(index * 30, 300)}ms`,
      }}
    >
      {/* Top 16:10 Recessed Preview Window */}
      <div className="relative aspect-[16/10] w-full bg-forest-dark overflow-hidden border-b border-[rgba(38,51,42,0.14)] flex items-center justify-center">
        {/* Live Preview vs WebP Thumbnail */}
        {showLivePreview && component.previewStatus === 'ready' ? (
          <PreviewSandbox
            component={component}
            theme="light"
            isActive={showLivePreview}
            onEvicted={() => setShowLivePreview(false)}
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={`/thumbs/${component.id}.webp`}
              alt={component.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // If thumbnail missing, show stylized crate icon fallback
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Fallback pattern if thumbnail not loaded */}
            <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center p-4 text-cream/40 bg-gradient-to-br from-forest-dark to-forest">
              <span className="font-display text-sm tracking-wide text-cream/60">{component.name}</span>
              <span className="text-[10px] font-mono mt-1 opacity-70">
                {component.source} • {component.styling}
              </span>
            </div>
          </div>
        )}

        {/* Top Floating Badges: Amber Pushpin & Status Dot */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Preview Status Pill */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold backdrop-blur-md border shadow-xs ${statusInfo.badgeClass}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  component.previewStatus === 'ready'
                    ? 'bg-emerald-400'
                    : component.previewStatus === 'needs-demo'
                    ? 'bg-amber-400'
                    : component.previewStatus === 'primitive'
                    ? 'bg-sky-400'
                    : 'bg-rose-400'
                }`}
              />
              <span>{statusInfo.label}</span>
            </span>
          </div>

          {/* Pushpin favorite button */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={component.favorite ? 'Unpin component' : 'Pin component'}
            className={`p-1.5 rounded-full backdrop-blur-md border transition-all cursor-pointer pointer-events-auto shadow-xs ${
              component.favorite
                ? 'bg-orange border-orange text-forest fill-forest shadow-md'
                : 'bg-forest/70 border-cream/20 text-cream/70 hover:text-orange hover:border-orange'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 stroke-[2] ${component.favorite ? 'fill-forest' : ''}`} />
          </button>
        </div>

        {/* Bottom Bar overlay during hover with quick actions */}
        <div
          className={`absolute bottom-2 inset-x-2 flex items-center justify-end gap-1.5 transition-all duration-200 z-10 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy Code (C)"
            className="px-2.5 py-1 rounded-lg bg-forest/85 hover:bg-forest text-cream font-display text-[11px] backdrop-blur-md border border-cream/20 flex items-center gap-1 shadow-md transition-all cursor-pointer"
          >
            {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-orange" />}
            <span>{copiedCode ? 'Copied' : 'Code'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyPrompt}
            title="Copy AI Prompt (P)"
            className="px-2.5 py-1 rounded-lg bg-forest/85 hover:bg-forest text-cream font-display text-[11px] backdrop-blur-md border border-cream/20 flex items-center gap-1 shadow-md transition-all cursor-pointer"
          >
            {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Sparkles className="w-3 h-3 text-amber-300" />}
            <span>{copiedPrompt ? 'Copied' : 'Prompt'}</span>
          </button>

          <button
            type="button"
            onClick={handleAddToKit}
            title={isSelectedInKit ? 'Remove from Kit' : 'Add to Kit'}
            className={`p-1 rounded-lg backdrop-blur-md border shadow-md transition-all cursor-pointer ${
              isSelectedInKit
                ? 'bg-orange text-forest border-orange font-bold'
                : 'bg-forest/85 hover:bg-forest text-cream border-cream/20'
            }`}
          >
            {isSelectedInKit ? (
              <Check className="w-3.5 h-3.5 text-forest" />
            ) : (
              <Plus className="w-3.5 h-3.5 text-cream" />
            )}
          </button>
        </div>
      </div>

      {/* Middle Label Strip in Oat Light */}
      <div className="p-3.5 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm font-bold text-ink tracking-tight line-clamp-1 group-hover:text-orange-deep transition-colors">
            {component.name}
          </h3>
          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(38,51,42,0.08)] text-ink/75 font-semibold shrink-0">
            {component.category}
          </span>
        </div>

        {/* Chips: Source, Styling, Deps */}
        <div className="flex items-center flex-wrap gap-1.5 text-[11px] font-sans">
          <span className="px-2 py-0.5 rounded-md bg-[rgba(38,51,42,0.06)] text-ink/70 font-medium">
            {component.source}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[rgba(38,51,42,0.06)] text-ink/70 font-mono text-[10px]">
            {component.styling}
          </span>
          {component.requires.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-800 text-[10px] font-mono">
              +{component.requires.length} req
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
