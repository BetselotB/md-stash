import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[var(--scrim)] animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[var(--dialog-bg)] border border-[rgba(38,51,42,0.15)] rounded-2xl shadow-[0_20px_50px_-10px_rgba(38,51,42,0.3)] text-ink overflow-hidden transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Paper grain overlay */}
        <div
          className="bg-paper-grain absolute inset-0 pointer-events-none rounded-2xl"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(38,51,42,0.15)]">
            <div>
              <h3 className="font-display text-2xl tracking-tight text-ink leading-tight">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-ink/75 font-sans mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink/70 hover:text-ink hover:bg-[var(--field-bg)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-[80vh] overflow-y-auto font-sans">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};
