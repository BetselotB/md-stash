import React from 'react';

export interface PillProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared site-wide Pill component.
 * Displays clean text on a soft rounded background.
 * Strictly dot-free, icon-free, and rendered in the display font in sentence case.
 */
export const Pill: React.FC<PillProps> = ({ children, className = '' }) => {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full bg-cream-dim border border-line-ink text-xs font-display text-ink ${className}`}
    >
      {children}
    </span>
  );
};
