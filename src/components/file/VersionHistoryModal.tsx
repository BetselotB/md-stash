import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
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
    if (confirm('Restore this snapshot? Your current content will be saved as a new version.')) {
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
      title="Version History"
      description={`Snapshots captured for ${file.filename}`}
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Versions list */}
        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1 border-r border-line/50">
          <button
            type="button"
            onClick={() => setSelectedVersion(null)}
            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              selectedVersion === null
                ? 'border-orange bg-orange/20 text-cream'
                : 'border-line bg-forest hover:bg-forest-light text-cream-dim'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-orange mb-1">
              <span>Current Working Copy</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[11px] text-cream-dim">
              Updated {new Date(file.updatedAt).toLocaleString()}
            </div>
          </button>

          {versions.length === 0 ? (
            <p className="text-xs text-cream-dim/60 p-3 italic">
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
                    ? 'border-orange bg-orange/20 text-cream'
                    : 'border-line bg-forest hover:bg-forest-light text-cream-dim'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cream mb-1">
                  <Clock className="w-3.5 h-3.5 text-orange" />
                  <span>Snapshot #{versions.length - idx}</span>
                </div>
                <div className="text-[11px] text-cream-dim">
                  {new Date(v.createdAt).toLocaleString()}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Preview pane */}
        <div className="md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-line">
              <span className="text-xs text-cream-dim font-mono">
                {selectedVersion
                  ? `Snapshot from ${new Date(selectedVersion.createdAt).toLocaleTimeString()}`
                  : 'Current File Content'}
              </span>
              {selectedVersion && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleRestore(selectedVersion)}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Restore this Snapshot
                </Button>
              )}
            </div>
            <pre className="p-3 bg-forest-dark border border-line rounded-xl font-mono text-xs text-cream max-h-[380px] overflow-auto whitespace-pre-wrap">
              {activeContent}
            </pre>
          </div>

          <div className="flex justify-end pt-4 border-t border-line mt-4">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
