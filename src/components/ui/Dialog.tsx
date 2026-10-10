import React, { useEffect } from 'react';
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

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-dark/70 backdrop-blur-sm animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        className={`w-full ${maxWidthClasses[maxWidth]} bg-[#FDFAF2] border border-[rgba(38,51,42,0.18)] rounded-2xl shadow-[0_20px_50px_-10px_rgba(38,51,42,0.3)] text-ink overflow-hidden transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(38,51,42,0.12)]">
          <div>
            <h3 className="font-display text-2xl tracking-tight text-ink leading-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-ink/70 font-sans mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink/50 hover:text-ink hover:bg-cream-dim/30 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto font-sans">{children}</div>
      </div>
    </div>
  );
};
