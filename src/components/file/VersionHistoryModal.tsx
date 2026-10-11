import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { confirm } from '../ui/ConfirmDialog';
import { Version, StashFile } from '../../domain/types';
import { useVersions } from '../../hooks/useDb';
import { versionsRepo } from '../../db/versions.repo';
import { filesRepo } from '../../db/files.repo';
import { useUIStore } from '../../store/uiStore';
import { History, RotateCcw, Clock } from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: StashFile;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  const versions = useVersions(file.id);
  const { showToast } = useUIStore();
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  const activeContent = selectedVersion ? selectedVersion.content : file.content;

  const handleRestore = async (version: Version) => {
    const ok = await confirm({
      title: 'Restore snapshot?',
      body: 'Your current content will be saved as a new version before restoring.',
      confirmLabel: 'Restore snapshot',
      cancelLabel: 'Cancel',
      tone: 'default',
    });
    if (ok) {
      // Snapshot current first
      await versionsRepo.add(file.id, file.content);
      // Restore
      await filesRepo.update(file.id, { content: version.content, size: version.content.length });
      showToast('Version restored successfully', 'success');
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Version history"
      description={`Snapshots captured for ${file.filename}`}
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Versions list */}
        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1 border-r border-[rgba(38,51,42,0.15)]">
          <button
            type="button"
            onClick={() => setSelectedVersion(null)}
            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              selectedVersion === null
                ? 'border-orange bg-orange/20 text-ink'
                : 'border-[var(--field-border)] bg-[var(--field-bg)] hover:bg-[#C2BB9F] text-ink'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-orange mb-1 font-display">
              <span>Current working copy</span>
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <div className="text-[11px] text-ink/75">
              Updated {new Date(file.updatedAt).toLocaleString()}
            </div>
          </button>

          {versions.length === 0 ? (
            <p className="text-xs text-ink/65 p-3 italic">
              No previous edit snapshots yet. Snapshots are created automatically when you save changes.
            </p>
          ) : (
            versions.map((v, idx) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVersion(v)}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  selectedVersion?.id === v.id
                    ? 'border-orange bg-orange/20 text-ink'
                    : 'border-[var(--field-border)] bg-[var(--field-bg)] hover:bg-[#C2BB9F] text-ink'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-1 font-display">
                  <Clock className="w-3.5 h-3.5 text-orange" />
                  <span>Snapshot #{versions.length - idx}</span>
                </div>
                <div className="text-[11px] text-ink/75">
                  {new Date(v.createdAt).toLocaleString()}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Preview pane */}
        <div className="md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(38,51,42,0.15)]">
              <span className="text-xs text-ink/80 font-mono">
                {selectedVersion
                  ? `Snapshot from ${new Date(selectedVersion.createdAt).toLocaleTimeString()}`
                  : 'Current file content'}
              </span>
              {selectedVersion && (
                <button
                  type="button"
                  onClick={() => handleRestore(selectedVersion)}
                  className="min-h-[36px] px-3.5 py-1.5 rounded-full bg-orange hover:bg-orange-deep text-ink font-display text-xs font-bold tracking-wide transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-orange shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore snapshot</span>
                </button>
              )}
            </div>
            <pre className="p-3 bg-[var(--field-bg)] border border-[var(--field-border)] rounded-[10px] font-mono text-xs text-ink max-h-[380px] overflow-auto whitespace-pre-wrap">
              {activeContent}
            </pre>
          </div>

          <div className="flex justify-end pt-4 border-t border-[rgba(38,51,42,0.15)] mt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] h-10 px-4 py-2 rounded-full border border-[var(--field-border)] text-ink hover:bg-[rgba(38,51,42,0.06)] font-display text-sm tracking-wide transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
