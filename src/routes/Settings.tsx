import React, { useState, useEffect, useRef } from 'react';
import { persistenceService } from '../services/persistence';
import { importExportService } from '../services/importExport';
import { useFiles, useCollections } from '../hooks/useDb';
import { filesRepo } from '../db/files.repo';
import { collectionsRepo } from '../db/collections.repo';
import { versionsRepo } from '../db/versions.repo';
import { settingsRepo } from '../db/settings.repo';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/ui/Button';
import {
  HardDrive,
  ShieldCheck,
  Download,
  Upload,
  AlertTriangle,
  Heart,
  RefreshCw,
  FolderArchive,
  Info,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const files = useFiles();
  const collections = useCollections();
  const { showToast } = useUIStore();

  const [usageInfo, setUsageInfo] = useState({
    usage: 0,
    quota: 0,
    persisted: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const refreshStorage = async () => {
    const info = await persistenceService.getQuota();
    setUsageInfo(info);
  };

  useEffect(() => {
    refreshStorage();
  }, [files.length]);

  const handleRequestPersist = async () => {
    const success = await persistenceService.requestPersistence();
    await refreshStorage();
    if (success) {
      showToast('Storage successfully marked persistent by your browser!', 'success');
    } else {
      showToast('Browser could not grant persistent storage', 'info');
    }
  };

  const handleExportZip = async () => {
    if (files.length === 0) {
      showToast('No files to export yet', 'info');
      return;
    }
    setIsExporting(true);
    try {
      await importExportService.exportZip(files, collections);
      showToast('Exported stash zip successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const res = await importExportService.importZip(file);
      showToast(
        `Restored ${res.filesCount} file(s) and ${res.collectionsCount} collection(s)!`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to import zip file', 'error');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleWipeData = async () => {
    const confirmed = prompt(
      'Type "DELETE" to permanently erase all files, collections, and versions from this browser:'
    );
    if (confirmed === 'DELETE') {
      await filesRepo.clearAll();
      await collectionsRepo.clearAll();
      await versionsRepo.clearAll();
      await settingsRepo.clearAll();
      await refreshStorage();
      showToast('All local stash data has been erased', 'info');
    }
  };

  const usagePercent =
    usageInfo.quota > 0 ? ((usageInfo.usage / usageInfo.quota) * 100).toFixed(2) : '0';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="font-display text-4xl tracking-normal text-cream">
          Settings & Storage
        </h1>
        <p className="text-xs text-cream-dim mt-1">
          Manage your local IndexedDB storage, backups, and privacy controls.
        </p>
      </div>

      {/* Storage & Persistence Section */}
      <section className="p-6 bg-forest rounded-2xl border border-line space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-forest-dark border border-line text-orange">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-cream">Browser Storage Status</h2>
            <p className="text-xs text-cream-dim">
              All markdown files and metadata are stored purely on your local device.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-forest-dark rounded-xl border border-line">
            <span className="text-xs text-cream-dim">IndexedDB Usage</span>
            <div className="text-xl font-bold font-mono text-cream mt-1">
              {persistenceService.formatBytes(usageInfo.usage)}
            </div>
            <span className="text-[10px] text-cream-dim/60 font-mono">
              of {persistenceService.formatBytes(usageInfo.quota)} quota
            </span>
          </div>

          <div className="p-4 bg-forest-dark rounded-xl border border-line">
            <span className="text-xs text-cream-dim">Files Stashed</span>
            <div className="text-xl font-bold font-mono text-cream mt-1">
              {files.length}
            </div>
            <span className="text-[10px] text-cream-dim/60 font-mono">
              in {collections.length} collections
            </span>
          </div>

          <div className="p-4 bg-forest-dark rounded-xl border border-line flex flex-col justify-between">
            <div>
              <span className="text-xs text-cream-dim">Persistence Status</span>
              <div className="flex items-center gap-1.5 mt-1">
                {usageInfo.persisted ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">Guaranteed</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">Standard</span>
                  </>
                )}
              </div>
            </div>
            {!usageInfo.persisted && (
              <button
                type="button"
                onClick={handleRequestPersist}
                className="mt-2 text-xs text-orange hover:underline font-bold text-left cursor-pointer"
              >
                Request Persistence →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Export / Import Section */}
      <section className="p-6 bg-forest rounded-2xl border border-line space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-forest-dark border border-line text-orange">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-cream">Backups & Portability</h2>
            <p className="text-xs text-cream-dim">
              Export real <code>.md</code> files organized by folder with <code>manifest.json</code>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button
            variant="primary"
            onClick={handleExportZip}
            disabled={isExporting}
            icon={<Download className="w-4 h-4" />}
          >
            {isExporting ? 'Creating Zip...' : 'Export Entire Stash (.zip)'}
          </Button>

          <input
            ref={zipInputRef}
            type="file"
            accept=".zip"
            onChange={handleImportZip}
            className="hidden"
          />

          <Button
            variant="secondary"
            onClick={() => zipInputRef.current?.click()}
            disabled={isImporting}
            icon={<Upload className="w-4 h-4" />}
          >
            {isImporting ? 'Importing Zip...' : 'Restore from Zip Archive'}
          </Button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="p-6 bg-forest rounded-2xl border border-red-900/60 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-800 text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-red-200">Danger Zone</h2>
            <p className="text-xs text-cream-dim">
              Irreversible actions that clear local database tables.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="danger" size="sm" onClick={handleWipeData}>
            Clear All Stash Data
          </Button>
        </div>
      </section>

      {/* About */}
      <section className="p-6 bg-forest-dark/40 rounded-2xl border border-line text-xs text-cream-dim leading-relaxed space-y-2">
        <div className="font-bold text-cream text-sm flex items-center gap-2">
          <span>MDstash v1.0.0</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange/20 text-orange font-mono">
            Local-First
          </span>
        </div>
        <p>
          MDstash is crafted for developers and AI tool users who need their markdown prompts, cursor rules, and notes immediately available without cloud lock-in.
        </p>
        <p className="text-[11px] text-cream-dim/60">
          No external tracking, no telemetry, no remote storage. Everything runs on your machine.
        </p>
      </section>
    </div>
  );
};
