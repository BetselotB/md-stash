import React from 'react';
import { CrateLogo } from '../ui/CrateLogo';

interface DropOverlayProps {
  isVisible: boolean;
}

export const DropOverlay: React.FC<DropOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sage/90 backdrop-blur-md pointer-events-none transition-all select-none">
      <div className="relative p-12 max-w-xl w-[90%] text-center rounded-3xl flex flex-col items-center justify-center gap-4 animate-scaleUp">
        {/* Big dashed arch matching landing hero style */}
        <div className="relative w-full h-72 flex flex-col items-center justify-center p-8">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
          >
            <path
              d="M 4 96 L 4 45 A 96 45 0 0 1 196 45 L 196 96"
              fill="none"
              stroke="rgba(248, 247, 230, 0.45)"
              strokeWidth="2.5"
              strokeDasharray="6 6"
            />
          </svg>

          {/* Crate logo */}
          <div className="relative mb-3 animate-bob">
            <CrateLogo
              className="w-24 h-24 object-contain drop-shadow-xl"
              style={{
                // @ts-expect-error CSS variables
                '--logo-body': 'var(--forest)',
                '--logo-doc': 'var(--orange)',
                '--logo-mark': 'var(--cream)',
              }}
            />
          </div>

          <h2 className="font-display text-4xl sm:text-5xl text-cream tracking-tight leading-none mb-1">
            Drop to stash
          </h2>
          <p className="text-cream/80 text-xs sm:text-sm max-w-sm font-sans">
            Release your markdown files or folders here to stash them locally.
          </p>
        </div>
      </div>
    </div>
  );
};
