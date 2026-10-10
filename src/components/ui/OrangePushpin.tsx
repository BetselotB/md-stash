import React from 'react';
import { Pin } from 'lucide-react';

interface PinGlyphProps {
  size?: number;
  isPinned?: boolean;
  className?: string;
  strokeWidth?: number;
}

/**
 * The original diagonal pushpin glyph (Lucide Pin style).
 * Unpinned: hollow outline with stroke.
 * Pinned: solid filled orange with thunk animation.
 */
export const PinGlyph: React.FC<PinGlyphProps> = ({
  size = 18,
  isPinned = true,
  className = '',
  strokeWidth = 1.75,
}) => {
  return (
    <Pin
      size={size}
      strokeWidth={strokeWidth}
      className={`transition-transform duration-200 shrink-0 ${
        isPinned
          ? 'fill-orange text-orange animate-pushpin-thunk'
          : 'fill-none text-current'
      } ${className}`}
      aria-hidden="true"
    />
  );
};

// Aliases for compatibility
export const PaperPinGlyph = PinGlyph;
export const OrangePushpin: React.FC<{
  isPinned?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}> = ({ isPinned = true, onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1 rounded-md transition-colors cursor-pointer ${className}`}
      title={isPinned ? 'Unpin' : 'Pin'}
      aria-label={isPinned ? 'Unpin file' : 'Pin file'}
    >
      <PinGlyph size={16} isPinned={isPinned} />
    </button>
  );
};
