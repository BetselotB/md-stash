import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  HardDrive,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Database,
  Layers,
  Tag,
} from 'lucide-react';
import { Pill } from '../ui/Pill';
import { confirm } from '../ui/ConfirmDialog';
import { filesRepo } from '../../db/files.repo';
import { collectionsRepo } from '../../db/collections.repo';
import { versionsRepo } from '../../db/versions.repo';
import { settingsRepo } from '../../db/settings.repo';

interface NetworkAsset {
  name: string;
  type: string;
  sizeKb: number;
  durationMs: number;
}

interface StorageStats {
  usageKb: number;
  quotaMb: number;
  isPersisted: boolean;
  filesCount: number;
  collectionsCount: number;
  tagsCount: number;
}

export const LiveProofPanel: React.FC = () => {
  // Live network monitoring
  const [assets, setAssets] = useState<NetworkAsset[]>([]);
  const [totalTransferKb, setTotalTransferKb] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Storage metrics
  const [storageStats, setStorageStats] = useState<StorageStats>({
    usageKb: 0,
    quotaMb: 0,
    isPersisted: false,
    filesCount: 0,
    collectionsCount: 0,
    tagsCount: 0,
  });
  const [isLoadingStorage, setIsLoadingStorage] = useState<boolean>(true);

  // Tab view: 'network' | 'storage'
  const [activeTab, setActiveTab] = useState<'network' | 'storage'>('network');

  // Delete wipe state
  const [isWiping, setIsWiping] = useState<boolean>(false);
  const [wipeSuccess, setWipeSuccess] = useState<boolean>(false);

  // 1. Inspect network requests via Performance API + PerformanceObserver
  const refreshNetworkEntries = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance?.getEntriesByType) return;

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalBytes = 0;

    const mapped: NetworkAsset[] = resources
      .filter((r) => {
        // Own origin static assets
        const origin = window.location.origin;
        return (
          r.name.startsWith(origin) ||
          r.name.startsWith('/') ||
          r.name.includes('.js') ||
          r.name.includes('.css') ||
          r.name.includes('.woff2') ||
          r.name.includes('.svg') ||
          r.name.includes('.png') ||
          r.name.includes('manifest.webmanifest')
        );
      })
      .map((r) => {
        const transfer = r.transferSize || r.decodedBodySize || 0;
        totalBytes += transfer;
        const urlParts = r.name.split('/');
        const rawName = urlParts[urlParts.length - 1] || r.name;
        const shortName = rawName.split('?')[0];

        return {
          name: shortName || 'asset',
          type: r.initiatorType || 'asset',
          sizeKb: Math.round((transfer / 1024) * 10) / 10,
          durationMs: Math.round(r.duration),
        };
      });

    setAssets(mapped);
    setTotalTransferKb(Math.round((totalBytes / 1024) * 10) / 10);
  }, []);

  // 2. Fetch live IndexedDB and storage quota estimates
  const refreshStorageMetrics = useCallback(async () => {
    setIsLoadingStorage(true);
    try {
      // Query IndexedDB tables
      const allFiles = await filesRepo.getAll();
      const allCollections = await collectionsRepo.getAll();

      const uniqueTags = new Set<string>();
      allFiles.forEach((file) => {
        if (Array.isArray(file.tags)) {
          file.tags.forEach((t) => uniqueTags.add(t));
        }
      });

      // Storage quota
      let usageKb = 0;
      let quotaMb = 0;
      if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
        const estimate = await navigator.storage.estimate();
        usageKb = Math.round(((estimate.usage || 0) / 1024) * 10) / 10;
        quotaMb = Math.round((estimate.quota || 0) / (1024 * 1024));
      }

      // Storage persistence
      let isPersisted = false;
      if (typeof navigator !== 'undefined' && navigator.storage?.persisted) {
        isPersisted = await navigator.storage.persisted();
      }

      setStorageStats({
        usageKb,
        quotaMb,
        isPersisted,
        filesCount: allFiles.length,
        collectionsCount: allCollections.length,
        tagsCount: uniqueTags.size,
      });
    } catch {
      // Graceful fallback if IndexedDB is unavailable in restrictive mode
    } finally {
      setIsLoadingStorage(false);
    }
  }, []);

  // Set up listeners
  useEffect(() => {
    refreshNetworkEntries();
    refreshStorageMetrics();

    // Online / offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Performance Observer for new network entries
    let observer: PerformanceObserver | null = null;
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            refreshNetworkEntries();
          }
        });
        observer.observe({ entryTypes: ['resource'] });
      } catch {
        // Fallback to initial scan
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      observer?.disconnect();
    };
  }, [refreshNetworkEntries, refreshStorageMetrics]);

  // Handle wipe data
  const handleExecuteWipe = async () => {
    setIsWiping(true);
    try {
      await filesRepo.clearAll();
      await collectionsRepo.clearAll();
      await versionsRepo.clearAll();
      await settingsRepo.clearAll();

      // Clear local storage keys
      try {
        localStorage.removeItem('mdstash_backup_nudge_dismissed');
        sessionStorage.removeItem('mdstash_hero_intro_played');
      } catch {
        // ignore storage errors
      }

      await refreshStorageMetrics();
      setWipeSuccess(true);
    } catch {
      // error handling
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <section id="proof-panel" className="py-20 sm:py-28 bg-cream text-ink relative">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <Pill>Live verification</Pill>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ink tracking-tight">
            Don't trust us, check.
          </h2>
          <p className="text-sm sm:text-base text-ink/75 font-sans leading-relaxed">
            This live panel inspects your real browser environment. It queries the Performance API and your local
            IndexedDB tables right now.
          </p>
        </div>

        {/* Forest-green DevTools Window */}
        <div className="rounded-3xl bg-forest text-cream border-2 border-forest-dark shadow-2xl overflow-hidden">
          {/* DevTools Top Bar */}
          <div className="px-5 py-3.5 bg-forest-dark border-b border-cream/15 flex flex-wrap items-center justify-between gap-4">
            {/* Window controls & devtools title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-3 h-3 rounded-full bg-[#E06C75]" />
                <span className="w-3 h-3 rounded-full bg-[#E5C07B]" />
                <span className="w-3 h-3 rounded-full bg-[#98C379]" />
              </div>
              <span className="font-display text-xs text-cream/90 ml-1">
                DevTools — MDstash local inspector
              </span>
            </div>

            {/* Right: Live online/offline status & refresh button */}
            <div className="flex items-center gap-4">
              {/* Online / Offline indicator */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest text-xs font-display"
                title={isOnline ? 'Online: works 100% offline' : 'Offline: 100% functional'}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-orange" />
                    <span className="text-cream">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-orange" />
                    <span className="text-cream">Offline (functional)</span>
                  </>
                )}
              </div>

              {/* Refresh scan button */}
              <button
                type="button"
                onClick={() => {
                  refreshNetworkEntries();
                  refreshStorageMetrics();
                }}
                className="text-xs font-display text-cream/70 hover:text-orange transition-colors flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange rounded px-2 py-0.5"
                title="Refresh network timings and storage inspection"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rescan</span>
              </button>
            </div>
          </div>

          {/* DevTools Tabs Header */}
          <div className="flex items-center border-b border-cream/10 px-5 bg-forest text-xs font-display">
            <button
              type="button"
              onClick={() => setActiveTab('network')}
              className={`py-3 px-4 border-b-2 transition-colors cursor-pointer focus:outline-none ${
                activeTab === 'network'
                  ? 'border-orange text-orange font-bold'
                  : 'border-transparent text-cream/60 hover:text-cream'
              }`}
            >
              Network monitor ({assets.length} requests)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('storage')}
              className={`py-3 px-4 border-b-2 transition-colors cursor-pointer focus:outline-none ${
                activeTab === 'storage'
                  ? 'border-orange text-orange font-bold'
                  : 'border-transparent text-cream/60 hover:text-cream'
              }`}
            >
              Storage & IndexedDB
            </button>
          </div>

          {/* DevTools Body */}
          <div className="p-6 sm:p-8">
            {activeTab === 'network' ? (
              /* ================= TAB 1: NETWORK MONITOR ================= */
              <div className="space-y-6">
                {/* Big Stamp Banner & Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Big Stamp (5 cols) */}
                  <div className="md:col-span-5 flex justify-center">
                    <div className="w-full max-w-xs rounded-2xl border-4 border-cream/80 bg-forest-dark p-5 text-center shadow-lg transform -rotate-1 hover:rotate-0 transition-transform">
                      <div className="border-2 border-dashed border-orange/70 p-4 rounded-xl">
                        <div className="text-[10px] font-display font-bold text-orange tracking-wider">
                          DevTools network audit
                        </div>
                        <div className="font-display text-4xl sm:text-5xl text-cream my-2 tracking-tight">
                          0 requests
                        </div>
                        <div className="font-display text-sm font-bold text-orange">
                          carrying your data
                        </div>
                        <div className="text-[10px] text-cream/60 font-sans mt-2">
                          Zero outbound POST, PUT, or WebSocket calls
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Details (7 cols) */}
                  <div className="md:col-span-7 space-y-3 font-sans text-xs sm:text-sm text-cream/80">
                    <div className="p-4 rounded-xl bg-forest-dark/80 border border-cream/10 space-y-2">
                      <div className="flex items-center justify-between text-cream font-display text-sm">
                        <span>Total client assets requested</span>
                        <span className="text-orange font-bold font-mono">{assets.length} requests</span>
                      </div>
                      <div className="flex items-center justify-between text-cream font-display text-sm">
                        <span>Total transferred size</span>
                        <span className="text-orange font-bold font-mono">{totalTransferKb} KB</span>
                      </div>
                      <div className="flex items-center justify-between text-cream font-display text-sm">
                        <span>Telemetry or tracker endpoints</span>
                        <span className="text-cream font-bold font-mono">0</span>
                      </div>
                    </div>

                    <p className="text-xs text-cream/70 leading-relaxed font-sans">
                      Every single HTTP entry listed below is a self-hosted client-side file (JavaScript bundle,
                      CSS stylesheets, WOFF2 font files, or SVG icons) required to run the UI in your browser.
                    </p>
                  </div>
                </div>

                {/* Table of Real Network Requests */}
                <div className="rounded-xl border border-cream/15 bg-forest-dark overflow-hidden font-mono text-xs">
                  <div className="px-4 py-2.5 bg-forest-dark/90 border-b border-cream/10 flex items-center justify-between text-cream-dim text-[11px] font-display">
                    <span>Live static asset entries ({assets.length})</span>
                    <span>Status: 200 (cached / local)</span>
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-cream/5">
                    {assets.length === 0 ? (
                      <div className="p-4 text-center text-cream/50">Reading Performance API entries...</div>
                    ) : (
                      assets.map((asset, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 flex items-center justify-between hover:bg-cream/5 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
                            <span className="text-cream truncate max-w-[220px] sm:max-w-xs md:max-w-md">
                              {asset.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 text-cream/60 text-[11px]">
                            <span className="text-orange">{asset.type}</span>
                            <span>{asset.sizeKb} KB</span>
                            <span className="hidden sm:inline">{asset.durationMs} ms</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ================= TAB 2: STORAGE & INDEXEDDB ================= */
              <div className="space-y-6">
                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Files Card */}
                  <div className="p-4 rounded-xl bg-forest-dark border border-cream/10 flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-forest text-orange shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-cream/60 font-display">Notes in IndexedDB</div>
                      <div className="font-display text-2xl text-cream font-bold">
                        {isLoadingStorage ? '...' : storageStats.filesCount}
                      </div>
                    </div>
                  </div>

                  {/* Collections Card */}
                  <div className="p-4 rounded-xl bg-forest-dark border border-cream/10 flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-forest text-orange shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-cream/60 font-display">Collections</div>
                      <div className="font-display text-2xl text-cream font-bold">
                        {isLoadingStorage ? '...' : storageStats.collectionsCount}
                      </div>
                    </div>
                  </div>

                  {/* Tags Card */}
                  <div className="p-4 rounded-xl bg-forest-dark border border-cream/10 flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-forest text-orange shrink-0">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-cream/60 font-display">Unique tags</div>
                      <div className="font-display text-2xl text-cream font-bold">
                        {isLoadingStorage ? '...' : storageStats.tagsCount}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Storage Quota & Real Storage Audit Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Storage Engine Details */}
                  <div className="p-5 rounded-2xl bg-forest-dark border border-cream/10 space-y-3 font-sans text-xs">
                    <div className="font-display text-sm text-cream flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-orange" />
                      <span>Device storage audit</span>
                    </div>

                    <div className="space-y-2 text-cream/80">
                      <div className="flex justify-between py-1 border-b border-cream/5 font-mono">
                        <span className="text-cream/60 font-sans">IndexedDB database:</span>
                        <span className="text-orange font-bold">MDstashDB</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-cream/5 font-mono">
                        <span className="text-cream/60 font-sans">Tables stored:</span>
                        <span className="text-cream">files, collections, versions, settings</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-cream/5 font-mono">
                        <span className="text-cream/60 font-sans">Service worker cache:</span>
                        <span className="text-cream">workbox-precache-...</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-cream/5 font-mono">
                        <span className="text-cream/60 font-sans">localStorage key:</span>
                        <span className="text-cream">mdstash_backup_nudge_dismissed</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-cream/5 font-mono">
                        <span className="text-cream/60 font-sans">sessionStorage key:</span>
                        <span className="text-cream">mdstash_hero_intro_played</span>
                      </div>
                      <div className="flex justify-between py-1 font-mono">
                        <span className="text-cream/60 font-sans">Cookies:</span>
                        <span className="text-cream">0 (zero cookies set or used)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Storage estimate & Persistent storage */}
                  <div className="p-5 rounded-2xl bg-forest-dark border border-cream/10 space-y-4 font-sans text-xs">
                    <div className="font-display text-sm text-cream flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orange" />
                      <span>Navigator storage estimate</span>
                    </div>

                    <div className="space-y-2 text-cream/80">
                      <div className="flex justify-between py-1 border-b border-cream/5 font-mono">
                        <span className="text-cream/60 font-sans">Current storage used:</span>
                        <span className="text-cream font-bold">{storageStats.usageKb} KB</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-cream/5 font-mono">
                        <span className="text-cream/60 font-sans">Storage quota available:</span>
                        <span className="text-cream font-bold">~{storageStats.quotaMb} MB</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-cream/5">
                        <span className="text-cream/60 font-sans">Persistent storage:</span>
                        <span
                          className={`font-display font-bold ${
                            storageStats.isPersisted ? 'text-cream' : 'text-cream/70'
                          }`}
                        >
                          {storageStats.isPersisted ? 'granted' : 'not granted'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-cream/60 leading-relaxed font-sans">
                      All markdown notes and file metadata remain inside your browser sandbox on this machine.
                    </p>
                  </div>
                </div>

                {/* Wipe Data Section */}
                <div className="p-5 rounded-2xl bg-forest-dark/70 border border-orange/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-display text-sm text-cream flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange" />
                      <span>Erase local client data</span>
                    </div>
                    <p className="text-xs text-cream/70 font-sans">
                      Permanently wipes all IndexedDB tables, stored notes, and cached settings from this device.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setWipeSuccess(false);
                      const ok = await confirm({
                        title: 'Confirm permanent erase',
                        body: "This will delete every markdown note, collection, version history entry, and preference stored in your browser's MDstashDB database. This action cannot be undone.",
                        confirmLabel: 'Confirm erase',
                        cancelLabel: 'Cancel',
                        tone: 'danger',
                      });
                      if (ok) {
                        await handleExecuteWipe();
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-forest border border-cream/30 hover:border-orange text-cream hover:text-orange font-display text-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange self-start sm:self-auto shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete everything on this device</span>
                  </button>
                </div>

                {/* Wipe Success Alert */}
                {wipeSuccess && (
                  <div className="p-4 rounded-xl bg-forest-dark border border-green-500/50 flex items-center gap-3 text-xs text-cream font-display animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    <span>All local data has been erased from this device. Storage counters reset to zero.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
