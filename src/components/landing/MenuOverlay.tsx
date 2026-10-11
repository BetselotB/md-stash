import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
}) => {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const pendingNavRef = useRef<(() => void) | null>(null);

  const [overlayTheme, setOverlayTheme] = useState<'sage' | 'cream'>('sage');
  const [isRendered, setIsRendered] = useState<boolean>(isOpen);

  const isCream = overlayTheme === 'cream';

  // Read nav theme at open time (snapshot)
  const getNavTheme = useCallback((): 'sage' | 'cream' => {
    const nav = document.querySelector('nav[data-testid="landing-nav"]') || document.querySelector('nav');
    const theme = nav?.getAttribute('data-theme');
    if (theme === 'cream' || theme === 'sage') return theme;
    return 'sage';
  }, []);

  // Clean up inert / aria-hidden and styles on page behind
  const restorePageBehind = useCallback(() => {
    const pageElements = document.querySelectorAll<HTMLElement>(
      'main, #cream-curtain, section, footer, nav[data-testid="landing-nav"]'
    );
    pageElements.forEach((el) => {
      el.removeAttribute('aria-hidden');
      el.inert = false;
      el.style.willChange = '';
    });
    const mainTargets = Array.from(document.querySelectorAll<HTMLElement>('main, #cream-curtain, section, footer'));
    if (mainTargets.length > 0) {
      gsap.set(mainTargets, { clearProps: 'transform,opacity,scale' });
    }
  }, []);

  // Build animation timeline
  const setupTimeline = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return null;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Center coordinates of the Menu button
    const menuBtn = document.querySelector('.nav-menu-btn');
    const rect = menuBtn?.getBoundingClientRect();
    const originX = rect && rect.width > 0 ? rect.left + rect.width / 2 : window.innerWidth - 60;
    const originY = rect && rect.height > 0 ? rect.top + rect.height / 2 : 44;

    const maxRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY)
    );

    const pageBehind = Array.from(
      document.querySelectorAll<HTMLElement>('main, #cream-curtain, section, footer')
    );
    const headerEl = overlay.querySelector('.menu-header');
    const rules = Array.from(overlay.querySelectorAll<HTMLElement>('.menu-rule'));
    const linkInners = Array.from(overlay.querySelectorAll<HTMLElement>('.menu-link-inner'));
    const footerEl = overlay.querySelector('.menu-footer');

    // Kill any existing timeline
    if (tlRef.current) {
      tlRef.current.kill();
    }

    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        overlay.style.display = 'flex';
        overlay.style.willChange = 'clip-path, opacity';
        pageBehind.forEach((el) => {
          el.style.willChange = 'transform, opacity';
          el.setAttribute('aria-hidden', 'true');
          el.inert = true;
        });

        // Stop Lenis and body scroll
        (window as unknown as { lenis?: { stop: () => void } }).lenis?.stop();
        document.body.style.overflow = 'hidden';

        // Focus close button on open
        closeButtonRef.current?.focus();
      },
      onComplete: () => {
        overlay.style.willChange = '';
        pageBehind.forEach((el) => {
          el.style.willChange = '';
        });
      },
      onReverseComplete: () => {
        overlay.style.display = 'none';
        overlay.style.willChange = '';
        restorePageBehind();

        // Restart Lenis and body scroll
        (window as unknown as { lenis?: { start: () => void } }).lenis?.start();
        document.body.style.overflow = '';

        // Return focus to previously focused element or menu button
        const target =
          previouslyFocusedRef.current && previouslyFocusedRef.current !== document.body
            ? previouslyFocusedRef.current
            : document.querySelector<HTMLElement>('.nav-menu-btn');
        target?.focus();

        // Perform any deferred navigation smoothly after overlay has closed
        if (pendingNavRef.current) {
          const fn = pendingNavRef.current;
          pendingNavRef.current = null;
          fn();
        }

        setIsRendered(false);
      },
    });

    if (prefersReducedMotion) {
      tl.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.15, ease: 'power1.out' },
        0
      );
      if (pageBehind.length > 0) {
        tl.fromTo(
          pageBehind,
          { opacity: 1 },
          { opacity: 0.9, duration: 0.15, ease: 'power1.out' },
          0
        );
      }
    } else {
      // 1. Expanding clip-path circle (0.55s power3.inOut)
      tl.fromTo(
        overlay,
        {
          clipPath: `circle(0px at ${originX}px ${originY}px)`,
          opacity: 1,
        },
        {
          clipPath: `circle(${maxRadius}px at ${originX}px ${originY}px)`,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.inOut',
        },
        0
      );

      // 2. Page behind scales down slightly (0.985) and dims
      if (pageBehind.length > 0) {
        tl.fromTo(
          pageBehind,
          { scale: 1, opacity: 1 },
          {
            scale: 0.985,
            opacity: 0.88,
            transformOrigin: '50% 0%',
            duration: 0.55,
            ease: 'power3.inOut',
          },
          0
        );
      }

      // 3. Header & Footer fade in
      if (headerEl) {
        tl.fromTo(
          headerEl,
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
          0.08
        );
      }
      if (footerEl) {
        tl.fromTo(
          footerEl,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
          0.08
        );
      }

      // 4. Hairline rules draw in from left (scaleX: 0 to 1)
      if (rules.length > 0) {
        tl.fromTo(
          rules,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.35, ease: 'power2.out', stagger: 0.03 },
          0.06
        );
      }

      // 5. Links rise from mask (~0.55s total)
      if (linkInners.length > 0) {
        tl.fromTo(
          linkInners,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.38,
            ease: 'expo.out',
            stagger: 0.035,
          },
          0.08
        );
      }
    }

    tlRef.current = tl;
    return tl;
  }, [restorePageBehind]);

  // Handle open/close state transitions
  useEffect(() => {
    if (isOpen) {
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && activeEl !== document.body) {
        previouslyFocusedRef.current = activeEl;
      } else {
        previouslyFocusedRef.current = document.querySelector<HTMLElement>('.nav-menu-btn');
      }

      const snapshottedTheme = getNavTheme();
      setOverlayTheme(snapshottedTheme);
      setIsRendered(true);

      requestAnimationFrame(() => {
        if (!tlRef.current || tlRef.current.progress() === 0) {
          setupTimeline();
        }
        tlRef.current?.timeScale(1).play();
      });
    } else {
      if (tlRef.current && tlRef.current.progress() > 0) {
        // Close in ~0.4s via timeScale(0.55 / 0.4 = 1.375)
        tlRef.current.timeScale(1.375).reverse();
      } else {
        setIsRendered(false);
      }
    }
  }, [isOpen, getNavTheme, setupTimeline]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      tlRef.current?.kill();
      restorePageBehind();
      try {
        (window as unknown as { lenis?: { start?: () => void } }).lenis?.start?.();
      } catch {
        // ignore
      }
      document.body.style.overflow = '';
    };
  }, [restorePageBehind]);

  // Focus trap & Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && overlayRef.current) {
        const focusableElements = overlayRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Smooth navigation handlers
  const handleAnchorClick = (sectionId: string) => {
    pendingNavRef.current = () => {
      onNavigateSection(sectionId);
    };
    onClose();
  };

  const handleRouteClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    pendingNavRef.current = () => {
      navigate(path);
    };
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      data-theme={overlayTheme}
      style={{
        display: isRendered ? 'flex' : 'none',
        backgroundColor: isCream ? 'rgba(248, 247, 230, 0.94)' : 'rgba(47, 58, 51, 0.98)',
        // Shared nav color timing
        transition:
          'color var(--nav-color-duration) var(--nav-color-ease), border-color var(--nav-color-duration) var(--nav-color-ease), background-color var(--nav-color-duration) var(--nav-color-ease)',
      }}
      className={`fixed inset-0 z-[60] flex-col justify-between p-6 sm:p-12 md:p-16 overflow-hidden backdrop-blur-xl ${
        isCream
          ? 'text-ink selection:bg-orange selection:text-forest'
          : 'text-cream selection:bg-orange selection:text-forest'
      }`}
    >
      {/* Paper grain overlay on top */}
      <div
        className="pointer-events-none absolute inset-0 bg-paper-grain opacity-100 -z-10"
        aria-hidden="true"
      />

      {/* Theme-aware bottom gradient: oat on cream, dark forest on sage */}
      <div
        className={`absolute bottom-0 inset-x-0 h-44 pointer-events-none -z-10 bg-gradient-to-t ${
          isCream
            ? 'from-[#D8D3BC]/65 to-transparent'
            : 'from-forest-dark/90 to-transparent'
        }`}
        aria-hidden="true"
      />

      {/* ================= 1. TOP HEADER ================= */}
      <div className="menu-header flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="MDstash" className="w-8 h-8 object-contain" />
          <span
            className={`font-display text-2xl tracking-tight ${
              isCream ? 'text-ink' : 'text-cream'
            }`}
          >
            MD
            <span className={isCream ? 'text-[#B36B15]' : 'text-orange'}>
              stash
            </span>
          </span>
          <span
            className={`text-[11px] font-display px-2.5 py-0.5 rounded-full border transition-colors ${
              isCream
                ? 'bg-ink/5 border-ink/20 text-ink'
                : 'bg-forest-dark border-line text-cream'
            }`}
          >
            Menu
          </span>
        </div>

        {/* Dark close button with cream X and orange focus ring */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="p-2.5 rounded-full bg-forest-dark border border-line text-cream hover:text-orange hover:border-orange transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange"
        >
          <X className="w-6 h-6 stroke-[2]" />
        </button>
      </div>

      {/* Hairline rule under header */}
      <div
        className={`menu-rule w-full h-[1px] -mt-6 mb-2 origin-left ${
          isCream ? 'bg-ink/25' : 'bg-line'
        }`}
        aria-hidden="true"
      />

      {/* ================= 2. MAIN NAVIGATION LINKS ================= */}
      <nav className="my-auto py-6 flex flex-col gap-3 sm:gap-4 max-w-2xl">
        {/* Link 1: How it works */}
        <div>
          <div className="overflow-hidden">
            <button
              type="button"
              onClick={() => handleAnchorClick('#how-it-works')}
              className={`menu-link-inner group w-full flex items-center justify-between text-left font-display text-4xl sm:text-6xl py-2 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded-lg ${
                isCream ? 'text-ink hover:text-orange' : 'text-cream hover:text-orange'
              }`}
            >
              <span>How it works</span>
              <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange shrink-0" />
            </button>
          </div>
          <div
            className={`menu-rule w-full h-[1px] origin-left ${
              isCream ? 'bg-ink/25' : 'bg-line/40'
            }`}
            aria-hidden="true"
          />
        </div>

        {/* Link 2: Features */}
        <div>
          <div className="overflow-hidden">
            <button
              type="button"
              onClick={() => handleAnchorClick('#features')}
              className={`menu-link-inner group w-full flex items-center justify-between text-left font-display text-4xl sm:text-6xl py-2 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded-lg ${
                isCream ? 'text-ink hover:text-orange' : 'text-cream hover:text-orange'
              }`}
            >
              <span>Features</span>
              <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange shrink-0" />
            </button>
          </div>
          <div
            className={`menu-rule w-full h-[1px] origin-left ${
              isCream ? 'bg-ink/25' : 'bg-line/40'
            }`}
            aria-hidden="true"
          />
        </div>

        {/* Link 3: Privacy */}
        <div>
          <div className="overflow-hidden">
            <a
              href="/privacy"
              onClick={(e) => handleRouteClick(e, '/privacy')}
              className={`menu-link-inner group w-full flex items-center justify-between text-left font-display text-4xl sm:text-6xl py-2 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded-lg ${
                isCream ? 'text-ink hover:text-orange' : 'text-cream hover:text-orange'
              }`}
            >
              <span>Privacy</span>
              <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange shrink-0" />
            </a>
          </div>
          <div
            className={`menu-rule w-full h-[1px] origin-left ${
              isCream ? 'bg-ink/25' : 'bg-line/40'
            }`}
            aria-hidden="true"
          />
        </div>

        {/* Link 4: Open MDstash (stays orange; darker token on cream for >= 3:1 contrast) */}
        <div>
          <div className="overflow-hidden">
            <a
              href="/app"
              onClick={(e) => handleRouteClick(e, '/app')}
              className={`menu-link-inner group w-full flex items-center justify-between text-left font-display text-4xl sm:text-6xl py-2 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded-lg ${
                isCream
                  ? 'text-[#B36B15] hover:text-[#94550E]'
                  : 'text-orange hover:text-orange-deep'
              }`}
            >
              <span>Open MDstash</span>
              <ArrowRight className="w-6 h-6 -translate-x-2 group-hover:translate-x-0 transition-all shrink-0 text-orange" />
            </a>
          </div>
          <div
            className={`menu-rule w-full h-[1px] origin-left ${
              isCream ? 'bg-ink/25' : 'bg-line/40'
            }`}
            aria-hidden="true"
          />
        </div>

        {/* Link 5: GitHub repository */}
        <div>
          <div className="overflow-hidden">
            <a
              href="https://github.com/Jole-19/MDstash"
              target="_blank"
              rel="noopener noreferrer"
              className={`menu-link-inner group w-full flex items-center justify-between text-left font-display text-2xl sm:text-3xl py-2 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded-lg ${
                isCream
                  ? 'text-ink/80 hover:text-ink'
                  : 'text-cream hover:text-orange'
              }`}
            >
              <span className="flex items-center gap-3">
                GitHub repository
                <ExternalLink
                  className={`w-4 h-4 transition-colors ${
                    isCream
                      ? 'text-ink/60 group-hover:text-ink'
                      : 'text-cream/70 group-hover:text-orange'
                  }`}
                />
              </span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hairline rule above footer */}
      <div
        className={`menu-rule w-full h-[1px] mb-6 origin-left ${
          isCream ? 'bg-ink/25' : 'bg-line'
        }`}
        aria-hidden="true"
      />

      {/* ================= 3. BOTTOM FOOTER INFO ================= */}
      <div
        className={`menu-footer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-display transition-colors ${
          isCream ? 'text-ink' : 'text-cream'
        }`}
      >
        <div>
          <span>Zero cloud · 100% local-first markdown organizer</span>
        </div>
        <div>
          <span>
            Press{' '}
            <kbd
              className={`px-1.5 py-0.5 rounded border font-display ${
                isCream
                  ? 'bg-ink/10 border-ink/25 text-ink'
                  : 'bg-forest-dark border-line text-cream'
              }`}
            >
              Esc
            </kbd>{' '}
            to close
          </span>
        </div>
      </div>
    </div>
  );
};
