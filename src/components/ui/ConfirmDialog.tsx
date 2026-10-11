import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Info } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  body: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  requireText?: string;
  filenameChip?: string;
}

export interface AlertOptions {
  title: string;
  body: string | React.ReactNode;
  confirmLabel?: string;
}

export interface PromptOptions {
  title: string;
  body: string | React.ReactNode;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

type DialogItem =
  | {
      id: string;
      kind: 'confirm';
      options: ConfirmOptions;
      resolve: (value: boolean) => void;
      triggerEl: HTMLElement | null;
    }
  | {
      id: string;
      kind: 'alert';
      options: AlertOptions;
      resolve: () => void;
      triggerEl: HTMLElement | null;
    }
  | {
      id: string;
      kind: 'prompt';
      options: PromptOptions;
      resolve: (value: string | null) => void;
      triggerEl: HTMLElement | null;
    };

// Global queue and listener system
const dialogQueue: DialogItem[] = [];
let activeDialog: DialogItem | null = null;
let queueListeners: Array<() => void> = [];

const notify = () => {
  queueListeners.forEach((fn) => fn());
};

const closeOpenMenusAndDropdowns = () => {
  if (typeof window === 'undefined') return;
  // Close any popover, custom dropdown, or menu by simulating outside click
  window.dispatchEvent(new CustomEvent('close-dropdowns'));
  document.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
};

export const confirm = (options: ConfirmOptions): Promise<boolean> => {
  const triggerEl = typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
  closeOpenMenusAndDropdowns();
  return new Promise<boolean>((resolve) => {
    const item: DialogItem = {
      id: `dialog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: 'confirm',
      options,
      resolve,
      triggerEl,
    };
    if (!activeDialog) {
      activeDialog = item;
    } else {
      dialogQueue.push(item);
    }
    notify();
  });
};

export const alertDialog = (options: AlertOptions): Promise<void> => {
  const triggerEl = typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
  closeOpenMenusAndDropdowns();
  return new Promise<void>((resolve) => {
    const item: DialogItem = {
      id: `dialog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: 'alert',
      options,
      resolve,
      triggerEl,
    };
    if (!activeDialog) {
      activeDialog = item;
    } else {
      dialogQueue.push(item);
    }
    notify();
  });
};

export const promptDialog = (options: PromptOptions): Promise<string | null> => {
  const triggerEl = typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
  closeOpenMenusAndDropdowns();
  return new Promise<string | null>((resolve) => {
    const item: DialogItem = {
      id: `dialog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: 'prompt',
      options,
      resolve,
      triggerEl,
    };
    if (!activeDialog) {
      activeDialog = item;
    } else {
      dialogQueue.push(item);
    }
    notify();
  });
};

export const useConfirm = () => ({
  confirm,
  alertDialog,
  promptDialog,
});

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, setTick] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [typedText, setTypedText] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const listener = () => {
      setTick((t) => t + 1);
    };
    queueListeners.push(listener);
    return () => {
      queueListeners = queueListeners.filter((fn) => fn !== listener);
    };
  }, []);

  const current = activeDialog;

  // Reset local typed state when active dialog changes
  useEffect(() => {
    if (current) {
      setIsClosing(false);
      if (current.kind === 'prompt') {
        setTypedText(current.options.defaultValue || '');
      } else {
        setTypedText('');
      }
    }
  }, [current?.id]);

  // Handle inert and scroll lock
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.getElementById('root');

    if (current) {
      document.body.style.overflow = 'hidden';
      if (root) {
        root.setAttribute('inert', '');
        root.setAttribute('aria-hidden', 'true');
      }
    } else {
      document.body.style.overflow = '';
      if (root) {
        root.removeAttribute('inert');
        root.removeAttribute('aria-hidden');
      }
    }

    return () => {
      document.body.style.overflow = '';
      if (root) {
        root.removeAttribute('inert');
        root.removeAttribute('aria-hidden');
      }
    };
  }, [Boolean(current)]);

  // Initial focus management
  useEffect(() => {
    if (!current || isClosing) return;

    const isRequireText =
      (current.kind === 'confirm' && Boolean(current.options.requireText)) ||
      current.kind === 'prompt';

    const applyFocus = () => {
      if (isRequireText && inputRef.current) {
        inputRef.current.focus();
      } else if (current.kind === 'confirm' && current.options.tone === 'danger') {
        // Initial focus on Cancel for danger dialogs (so Enter can't delete by accident)
        cancelBtnRef.current?.focus();
      } else if (confirmBtnRef.current) {
        // Initial focus on Confirm button for default dialogs
        confirmBtnRef.current.focus();
      } else if (cancelBtnRef.current) {
        cancelBtnRef.current.focus();
      }
    };

    applyFocus();
    const timer = setTimeout(applyFocus, 20);
    return () => clearTimeout(timer);
  }, [current?.id, isClosing]);

  const finishClose = useCallback((callback: () => void) => {
    setIsClosing(true);
    setTimeout(() => {
      const prevTrigger = activeDialog?.triggerEl;
      callback();
      setIsClosing(false);
      // Advance to next queued dialog if any
      if (dialogQueue.length > 0) {
        activeDialog = dialogQueue.shift() || null;
      } else {
        activeDialog = null;
      }
      notify();
      // Restore focus to trigger element
      try {
        prevTrigger?.focus();
      } catch {
        // Ignore if element is unmounted
      }
    }, 120); // 0.12s close duration
  }, []);

  const handleCancel = useCallback(() => {
    if (!current || isClosing) return;
    finishClose(() => {
      if (current.kind === 'confirm') {
        current.resolve(false);
      } else if (current.kind === 'prompt') {
        current.resolve(null);
      } else if (current.kind === 'alert') {
        current.resolve();
      }
    });
  }, [current, isClosing, finishClose]);

  const handleConfirm = useCallback(() => {
    if (!current || isClosing) return;

    if (current.kind === 'confirm') {
      if (current.options.requireText) {
        const required = current.options.requireText.trim().toLowerCase();
        if (typedText.trim().toLowerCase() !== required) {
          return;
        }
      }
      finishClose(() => current.resolve(true));
    } else if (current.kind === 'prompt') {
      finishClose(() => current.resolve(typedText));
    } else if (current.kind === 'alert') {
      finishClose(() => current.resolve());
    }
  }, [current, isClosing, typedText, finishClose]);

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    if (!current || isClosing) return;
    // Esc and clicking the backdrop cancel (except for the requireText wipe dialog, where backdrop click does nothing)
    const hasRequireText = current.kind === 'confirm' && Boolean(current.options.requireText);
    if (hasRequireText) {
      return;
    }
    handleCancel();
  };

  // Focus trap & keyboard handler (captured globally on window so shortcuts like "/" are blocked)
  useEffect(() => {
    if (!current || isClosing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore / stop page shortcuts (e.g. "/" or other global listeners)
      e.stopPropagation();

      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
        return;
      }

      if (e.key === 'Tab') {
        const card = cardRef.current;
        if (!card) return;

        const focusableElements = Array.from(
          card.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
        return;
      }

      if (e.key === 'Enter') {
        const isDanger = current.kind === 'confirm' && current.options.tone === 'danger';
        if (isDanger) {
          // For danger dialogs, Enter activates whichever button has focus
          // Do not accidentally confirm from input or cancel button
          if (document.activeElement === confirmBtnRef.current) {
            e.preventDefault();
            handleConfirm();
          } else if (document.activeElement === cancelBtnRef.current) {
            e.preventDefault();
            handleCancel();
          }
        } else {
          // Default dialogs: Enter confirms if confirm button is enabled and not focusing Cancel
          if (document.activeElement === cancelBtnRef.current) {
            e.preventDefault();
            handleCancel();
          } else {
            e.preventDefault();
            handleConfirm();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [current, isClosing, handleCancel, handleConfirm]);

  const tone = current?.kind === 'confirm' ? current.options.tone || 'default' : 'default';
  const isDanger = tone === 'danger';
  const role = isDanger ? 'alertdialog' : 'dialog';

  const requireText = current?.kind === 'confirm' ? current.options.requireText : undefined;
  const isRequireTextValid = requireText
    ? typedText.trim().toLowerCase() === requireText.trim().toLowerCase()
    : true;
  const isConfirmDisabled = !isRequireTextValid;

  const title = current ? current.options.title : '';
  const body = current ? current.options.body : null;
  const filenameChip = current?.kind === 'confirm' ? current.options.filenameChip : undefined;

  const confirmLabel =
    (current?.kind === 'confirm' && current.options.confirmLabel) ||
    (current?.kind === 'alert' && current.options.confirmLabel) ||
    (current?.kind === 'prompt' && current.options.confirmLabel) ||
    (current?.kind === 'alert' ? 'OK' : isDanger ? 'Delete' : 'Confirm');

  const cancelLabel =
    (current?.kind === 'confirm' && current.options.cancelLabel) ||
    (current?.kind === 'prompt' && current.options.cancelLabel) ||
    'Cancel';

  return (
    <>
      {children}
      {current &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            data-testid="confirm-dialog-backdrop"
            onClick={handleBackdropClick}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--scrim)] select-none ${
              isClosing ? 'confirm-backdrop-exit' : 'confirm-backdrop-enter'
            }`}
          >
            <div
              ref={cardRef}
              role={role}
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              aria-describedby="confirm-dialog-body"
              data-testid="confirm-dialog-card"
              className={`relative w-[calc(100vw-32px)] max-w-[440px] rounded-2xl bg-[var(--dialog-bg)] text-ink border border-[rgba(38,51,42,0.15)] shadow-[0_24px_50px_-12px_rgba(25,32,28,0.45)] p-6 sm:p-7 overflow-hidden ${
                isClosing ? 'confirm-card-exit' : 'confirm-card-enter'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Paper grain overlay */}
              <div
                className="bg-paper-grain absolute inset-0 pointer-events-none rounded-2xl"
                aria-hidden="true"
              />

              <div className="relative z-10">
                {/* Top Round Icon Tile (Flat, matte paper style) */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm mb-4 border ${
                    isDanger
                      ? 'bg-[var(--field-bg)] border-[rgba(168,56,42,0.3)] text-[var(--danger)]'
                      : 'bg-[var(--field-bg)] border-[rgba(194,125,27,0.35)] text-[#C27D1B]'
                  }`}
                  aria-hidden="true"
                >
                  {isDanger ? (
                    <Trash2 className="w-5 h-5 stroke-[2.2]" />
                  ) : (
                    <Info className="w-5 h-5 stroke-[2.2]" />
                  )}
                </div>

                {/* Dialog Title (display font, sentence case) */}
                <h2
                  id="confirm-dialog-title"
                  className="font-display text-2xl text-ink leading-snug tracking-normal mb-2"
                >
                  {title}
                </h2>

                {/* Filename Mono Chip if provided */}
                {filenameChip && (
                  <div className="mb-3">
                    <span
                      data-testid="confirm-dialog-filename-chip"
                      className="inline-block font-mono text-xs px-2.5 py-1 rounded-md bg-[rgba(38,51,42,0.08)] border border-[rgba(38,51,42,0.14)] text-ink break-all select-all font-medium"
                    >
                      {filenameChip}
                    </span>
                  </div>
                )}

                {/* Dialog Body (body font) */}
                <div
                  id="confirm-dialog-body"
                  className="font-sans text-sm text-ink/85 leading-relaxed"
                >
                  {typeof body === 'string' ? <p>{body}</p> : body}
                </div>

                {/* RequireText confirmation input */}
                {requireText && (
                  <div className="mt-4 space-y-2">
                    <label
                      htmlFor="confirm-dialog-input"
                      className="block font-display text-[13px] text-ink/80"
                    >
                      To confirm, type <span className="font-mono font-bold text-ink">"{requireText}"</span> below:
                    </label>
                    <input
                      id="confirm-dialog-input"
                      ref={inputRef}
                      type="text"
                      autoFocus
                      value={typedText}
                      onChange={(e) => setTypedText(e.target.value)}
                      placeholder={requireText}
                      autoComplete="off"
                      spellCheck={false}
                      data-testid="confirm-dialog-require-input"
                      className="w-full h-10 px-3 py-2 bg-[var(--field-bg)] border border-[var(--field-border)] rounded-[10px] text-ink font-mono text-sm focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/40 placeholder:text-ink/60 transition-colors"
                    />
                  </div>
                )}

                {/* Plain prompt input */}
                {current.kind === 'prompt' && !requireText && (
                  <div className="mt-4">
                    <input
                      id="confirm-dialog-input"
                      ref={inputRef}
                      type="text"
                      autoFocus
                      value={typedText}
                      onChange={(e) => setTypedText(e.target.value)}
                      placeholder={current.options.placeholder || ''}
                      autoComplete="off"
                      spellCheck={false}
                      data-testid="confirm-dialog-prompt-input"
                      className="w-full h-10 px-3 py-2 bg-[var(--field-bg)] border border-[var(--field-border)] rounded-[10px] text-ink font-mono text-sm focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/40 placeholder:text-ink/60 transition-colors"
                    />
                  </div>
                )}

                {/* Right-aligned Button Row */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-1">
                  {current.kind !== 'alert' && (
                    <button
                      ref={cancelBtnRef}
                      type="button"
                      onClick={handleCancel}
                      data-testid="confirm-dialog-cancel-btn"
                      className="min-h-[40px] h-10 px-4 py-2 rounded-full border border-[var(--field-border)] text-ink hover:bg-[rgba(38,51,42,0.06)] font-display text-xs sm:text-sm tracking-wide transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange"
                    >
                      {cancelLabel}
                    </button>
                  )}

                  <button
                    ref={confirmBtnRef}
                    type="button"
                    onClick={handleConfirm}
                    disabled={isConfirmDisabled}
                    data-testid="confirm-dialog-confirm-btn"
                    className={`min-h-[40px] h-10 px-5 py-2 rounded-full font-display text-xs sm:text-sm font-bold tracking-wide transition-colors cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${
                      isDanger
                        ? 'bg-[var(--danger)] hover:bg-[#963024] text-cream focus:ring-[var(--danger)] focus:ring-offset-2 focus:ring-offset-[#D8D3BC]'
                        : 'bg-orange hover:bg-orange-deep text-ink focus:ring-orange focus:ring-offset-2 focus:ring-offset-[#D8D3BC]'
                    }`}
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
