import React from 'react';

interface CrateGlyphProps {
  color: string;
  isOpen?: boolean;
  className?: string;
  size?: number;
}

/**
 * Flat, matte, paper-feel collection icon:
 * A simple folder-tab / index-card silhouette cut from craft paper.
 * Solid fill in the collection's own muted colour, tiny flat offset shadow,
 * NO gradients, NO stripes, NO gloss.
 */
export const CrateGlyph: React.FC<CrateGlyphProps> = ({
  color,
  isOpen = false,
  className = '',
  size = 20,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <path
          d="M2.5 5.5A1.5 1.5 0 0 1 4 4h4.5a1.5 1.5 0 0 1 1.2.6L10.8 6H16a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 16 16H4a1.5 1.5 0 0 1-1.5-1.5z"
          fill={color}
          className="transition-transform duration-200"
          style={{
            transform: isOpen ? 'translateY(-1.5px) scale(1.06)' : 'none',
            transformOrigin: 'bottom center',
          }}
        />
      </svg>
    </div>
  );
};
