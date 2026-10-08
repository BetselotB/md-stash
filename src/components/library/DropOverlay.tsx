import React from 'react';
import { UploadCloud } from 'lucide-react';

interface DropOverlayProps {
  isVisible: boolean;
}

export const DropOverlay: React.FC<DropOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-dark/85 backdrop-blur-md pointer-events-none transition-all">
      <div className="p-12 max-w-lg w-full text-center border-4 border-dashed border-pink/80 rounded-3xl bg-forest/90 shadow-2xl flex flex-col items-center gap-4 animate-scaleUp">
        <div className="w-20 h-20 rounded-full bg-pink/20 border border-pink flex items-center justify-center text-pink shadow-glow">
          <UploadCloud className="w-10 h-10 animate-bounce" />
        </div>
        <h2 className="font-display text-4xl text-cream uppercase tracking-wider">
          Drop your markdown files
        </h2>
        <p className="text-cream-dim text-sm max-w-sm">
          Release to stash your files or directories. Everything is stored locally in your browser.
        </p>
      </div>
    </div>
  );
};
