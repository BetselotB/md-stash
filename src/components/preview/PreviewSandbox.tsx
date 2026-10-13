import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ComponentMetadata, CodeBlob } from '../../domain/componentTypes';
import {
  generateSandboxHtml,
  iframeLRU,
  getPreviewStatusInfo,
} from '../../services/previewRuntime';
import { componentsRepo } from '../../db/components.repo';
import { AlertTriangle, RefreshCw, Sparkles, Box, Code } from 'lucide-react';

interface PreviewSandboxProps {
  component: ComponentMetadata;
  theme?: 'light' | 'dark';
  customProps?: Record<string, unknown>;
  viewportWidth?: number | string;
  isActive?: boolean;
  onEvicted?: () => void;
  showFallbackOnEvict?: boolean;
}

export const PreviewSandbox: React.FC<PreviewSandboxProps> = ({
  component,
  theme = 'light',
  customProps,
  viewportWidth = '100%',
  isActive = true,
  onEvicted,
  showFallbackOnEvict = true,
}) => {
  const [blob, setBlob] = useState<CodeBlob | null>(null);
  const [loading, setLoading] = useState(true);
  const [mountReady, setMountReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEvicted, setIsEvicted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Status info
  const statusInfo = getPreviewStatusInfo(component.previewStatus);

  // Load code blob from Dexie
  useEffect(() => {
    let isCancelled = false;

    async function loadBlob() {
      try {
        setLoading(true);
        setError(null);
        let data = await componentsRepo.getCodeBlob(component.id);

        if (!data) {
          // If not in Dexie yet, fetch from public registry or pilot pack
          try {
            const res = await fetch(`/r/${component.id}.json`);
            if (res.ok) {
              const regItem = await res.json();
              data = {
                id: component.id,
                code: regItem.files?.[0]?.content || '',
                props: [],
                deps: regItem.dependencies || [],
                dependsOn: regItem.registryDependencies || [],
                shared: ['utils/cn'],
              };
              await componentsRepo.putCodeBlob(data);
            }
          } catch {
            // Ignore fetch failure, will show fallback
          }
        }

        if (!isCancelled) {
          setBlob(data || null);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    }

    loadBlob();
    return () => {
      isCancelled = true;
    };
  }, [component.id]);

  // Handle LRU slot request
  const handleEviction = useCallback(() => {
    setIsEvicted(true);
    setMountReady(false);
    if (onEvicted) onEvicted();
  }, [onEvicted]);

  useEffect(() => {
    if (isActive && component.previewStatus === 'ready' && blob) {
      setIsEvicted(false);
      iframeLRU.requestSlot(component.id, handleEviction);

      return () => {
        iframeLRU.releaseSlot(component.id);
      };
    }
  }, [isActive, component.id, component.previewStatus, blob, handleEviction]);

  // Listen to postMessage from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_READY') {
        setMountReady(true);
        setError(null);
      } else if (event.data?.type === 'PREVIEW_ERROR') {
        setError(event.data.error || 'Preview runtime error');
      } else if (event.data?.type === 'PREVIEW_TIMEOUT') {
        if (!mountReady) {
          setError('Sandbox render timed out (5s)');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [mountReady]);

  // Non-ready or honest fallback states
  if (component.previewStatus !== 'ready') {
    return (
      <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center bg-forest-dark/40 border border-forest-light/30 rounded-xl">
        <div className="p-3 rounded-2xl bg-forest-dark/60 border border-forest-light/40 mb-3 text-cream/70">
          {component.previewStatus === 'needs-demo' ? (
            <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
          ) : component.previewStatus === 'primitive' ? (
            <Box className="w-7 h-7 text-sky-400" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          )}
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border mb-2 uppercase tracking-wider backdrop-blur-xs">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              component.previewStatus === 'needs-demo'
                ? 'bg-amber-400'
                : component.previewStatus === 'primitive'
                ? 'bg-sky-400'
                : 'bg-rose-400'
            }`}
          />
          <span className="text-cream">{statusInfo.label}</span>
        </div>

        <p className="text-xs text-cream/80 max-w-sm mb-4 leading-relaxed font-sans">
          {statusInfo.description}
        </p>

        {component.requires.length > 0 && (
          <div className="text-[11px] text-cream/60 font-mono mb-3">
            Requires: {component.requires.join(', ')}
          </div>
        )}

        {statusInfo.promptAction && (
          <button
            type="button"
            onClick={() => {
              const promptText = `Generate a self-contained visual demo wrapper for the "${component.name}" component (${component.id}) so it can be previewed cleanly.`;
              navigator.clipboard?.writeText(promptText);
              alert('Copied AI prompt to clipboard!');
            }}
            className="px-3 py-1.5 rounded-lg bg-orange hover:bg-orange-deep text-forest text-xs font-display flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{statusInfo.promptAction}</span>
          </button>
        )}
      </div>
    );
  }

  // If evicted by LRU or not active, show thumbnail fallback
  if ((isEvicted || !isActive) && showFallbackOnEvict) {
    return (
      <div className="relative w-full h-full min-h-[200px] flex items-center justify-center overflow-hidden bg-forest-dark/30 rounded-xl group">
        <img
          src={`/thumbs/${component.id}.webp`}
          alt={component.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // If thumb missing, fallback to icon placeholder
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-forest-dark/30 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-3 py-1.5 rounded-full bg-forest text-cream text-xs font-display shadow-md border border-cream/20 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-orange" />
            <span>Click to Activate Preview</span>
          </span>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-cream/70 bg-forest-dark/30 rounded-xl animate-pulse">
        <RefreshCw className="w-6 h-6 animate-spin text-orange mb-2" />
        <span className="text-xs font-sans">Compiling sandbox runtime...</span>
      </div>
    );
  }

  // Error state
  if (error || !blob) {
    return (
      <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center bg-rose-950/20 border border-rose-500/30 rounded-xl">
        <AlertTriangle className="w-8 h-8 text-rose-400 mb-2" />
        <h4 className="text-sm font-bold text-cream mb-1">Sandbox Compile Error</h4>
        <p className="text-xs text-rose-300 font-mono max-w-md break-words mb-3">
          {error || 'Component code could not be loaded'}
        </p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoading(true);
            setTimeout(() => setLoading(false), 200);
          }}
          className="px-3 py-1.5 rounded-lg border border-cream/30 hover:border-orange text-cream text-xs font-display flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Generate sandbox HTML
  let sandboxHtml = '';
  try {
    sandboxHtml = generateSandboxHtml(component, blob, {
      theme,
      props: customProps,
    });
  } catch (err: unknown) {
    return (
      <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center bg-rose-950/20 border border-rose-500/30 rounded-xl">
        <AlertTriangle className="w-7 h-7 text-rose-400 mb-2" />
        <p className="text-xs text-rose-300 font-mono">
          {err instanceof Error ? err.message : String(err)}
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative flex items-center justify-center w-full h-full min-h-[220px] overflow-hidden rounded-xl bg-forest-dark/20 transition-all"
      style={{
        width: typeof viewportWidth === 'number' ? `${viewportWidth}px` : viewportWidth,
        maxWidth: '100%',
      }}
    >
      <iframe
        ref={iframeRef}
        title={`${component.name} Sandbox`}
        srcDoc={sandboxHtml}
        sandbox="allow-scripts"
        className="w-full h-full min-h-[260px] border-0 rounded-xl bg-transparent transition-opacity duration-200"
        style={{
          opacity: mountReady ? 1 : 0.85,
        }}
      />
    </div>
  );
};
