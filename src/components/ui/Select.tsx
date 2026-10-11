import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  hint?: string;
}

export interface SelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  label?: string;
  placeholder?: string;
  placement?: 'up' | 'down';
  variant?: 'pill' | 'field';
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  id?: string;
  disabled?: boolean;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select option',
  placement = 'down',
  variant = 'pill',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  id,
  disabled = false,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const generatedId = useId();
  const selectId = id || generatedId;
  const listboxId = `${selectId}-listbox`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const [activeIndex, setActiveIndex] = useState<number>(
    selectedIndex >= 0 ? selectedIndex : 0
  );

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = Math.max(rect.width, 190);

    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - menuWidth - 12);
    }

    if (placement === 'up') {
      setCoords({
        bottom: window.innerHeight - rect.top + 6,
        left,
        width: menuWidth,
      });
    } else {
      setCoords({
        top: rect.bottom + 6,
        left,
        width: menuWidth,
      });
    }
  }, [placement]);

  const openMenu = () => {
    if (disabled) return;
    updatePosition();
    const idx = options.findIndex((opt) => opt.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
    setIsOpen(true);
  };

  const closeMenu = (returnFocus = true) => {
    setIsOpen(false);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  };

  const selectOption = (optValue: T) => {
    onChange(optValue);
    closeMenu(true);
  };

  // Keep position updated on scroll and window resize while open
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleWindowChange = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);
    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [isOpen, updatePosition]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % options.length);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      }
      case 'Home': {
        e.preventDefault();
        setActiveIndex(0);
        break;
      }
      case 'End': {
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (options[activeIndex]) {
          selectOption(options[activeIndex].value);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        e.stopPropagation(); // Prevent closing parent modal/tray
        closeMenu(true);
        break;
      }
      case 'Tab': {
        closeMenu(false);
        break;
      }
      default: {
        // Typeahead by first letter
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const char = e.key.toLowerCase();
          const startIdx = (activeIndex + 1) % options.length;
          for (let i = 0; i < options.length; i++) {
            const idx = (startIdx + i) % options.length;
            if (options[idx].label.trim().toLowerCase().startsWith(char)) {
              setActiveIndex(idx);
              break;
            }
          }
        }
        break;
      }
    }
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger pill */}
      <button
        ref={triggerRef}
        type="button"
        id={selectId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={label}
        disabled={disabled}
        onClick={() => (isOpen ? closeMenu(true) : openMenu())}
        onKeyDown={handleKeyDown}
        className={`${
          variant === 'field'
            ? 'w-full bg-[var(--field-bg)] text-ink border border-[var(--field-border)] rounded-[10px] px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-orange focus-visible:ring-2 focus-visible:ring-orange/40'
            : 'bg-[#D8D3BC] text-ink border border-[rgba(38,51,42,0.22)] rounded-full px-3.5 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange'
        } flex items-center justify-between gap-2.5 cursor-pointer select-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? 'ring-2 ring-orange/40 border-orange outline-none'
            : 'hover:border-[rgba(38,51,42,0.36)]'
        } ${triggerClassName}`}
      >
        <span
          className={`${
            variant === 'field' ? 'font-sans text-sm' : 'font-display text-xs'
          } tracking-tight text-ink truncate`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-ink/70 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Listbox in Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-label={label}
            aria-activedescendant={`${listboxId}-opt-${activeIndex}`}
            tabIndex={-1}
            style={{
              position: 'fixed',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 9999,
              backgroundColor: 'var(--dialog-bg)',
              ...(placement === 'up'
                ? { bottom: `${coords.bottom}px` }
                : { top: `${coords.top}px` }),
            }}
            className={`bg-[var(--dialog-bg)] text-ink border border-[rgba(38,51,42,0.20)] rounded-[12px] shadow-[0_12px_28px_-4px_rgba(38,51,42,0.28)] p-1 overflow-hidden select-none ${
              placement === 'up' ? 'animate-select-up' : 'animate-select-down'
            } ${menuClassName}`}
          >
            {/* Grain overlay */}
            <div
              className="pointer-events-none absolute inset-0 bg-paper-grain rounded-[12px]"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col space-y-0.5">
              {options.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isFocused = idx === activeIndex;

                return (
                  <div
                    key={opt.value}
                    id={`${listboxId}-opt-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectOption(opt.value)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`min-h-[40px] px-3 py-2 flex items-center justify-between gap-3 rounded-[8px] cursor-pointer transition-colors ${
                      isFocused
                        ? 'bg-[rgba(38,51,42,0.08)] text-ink'
                        : 'text-ink/90 hover:bg-[rgba(38,51,42,0.08)]'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-display text-xs tracking-tight text-ink truncate">
                        {opt.label}
                      </span>
                      {opt.hint && (
                        <span className="font-mono text-[10.5px] text-ink/75 tracking-tight truncate">
                          {opt.hint}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check
                        className="w-4 h-4 text-orange-deep shrink-0 ml-1.5"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
