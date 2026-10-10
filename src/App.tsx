import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { DesktopGate } from './components/gate/DesktopGate';

// Lazy-load the entire site bundle behind the desktop gate check
const DesktopApp = lazy(() => import('./DesktopApp'));

export const DESKTOP_MEDIA_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';

export const App: React.FC = () => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
  });

  // Track desktop breakpoint live via matchMedia change event (zero window resize re-renders)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onMediaQueryChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    if (mq.addEventListener) {
      mq.addEventListener('change', onMediaQueryChange);
    } else {
      mq.addListener(onMediaQueryChange);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', onMediaQueryChange);
      } else {
        mq.removeListener(onMediaQueryChange);
      }
    };
  }, []);

  // Cleanup routines when gated: kill animations, prevent PWA install prompt
  useEffect(() => {
    if (!isDesktop) {
      // Disable PWA install prompts on gated devices
      const handleBeforeInstall = (e: Event) => e.preventDefault();
      window.addEventListener('beforeinstallprompt', handleBeforeInstall);

      // Clean up any running GSAP timelines or ScrollTrigger instances if shrinking from desktop
      if (typeof window !== 'undefined') {
        const win = window as unknown as {
          lenis?: { destroy?: () => void } | null;
        };

        if (win.lenis && typeof win.lenis.destroy === 'function') {
          win.lenis.destroy();
          win.lenis = null;
        }

        // Dynamically kill GSAP and ScrollTriggers if they were loaded
        import('gsap')
          .then(({ default: gsap }) => {
            gsap.killTweensOf('*');
          })
          .catch(() => {});

        import('gsap/ScrollTrigger')
          .then(({ ScrollTrigger }) => {
            ScrollTrigger.getAll().forEach((st) => st.kill());
          })
          .catch(() => {});
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, [isDesktop]);

  return (
    <ErrorBoundary>
      <div className="grain-overlay" aria-hidden="true" />
      {!isDesktop ? (
        <DesktopGate />
      ) : (
        <Suspense fallback={<div className="min-h-screen bg-sage text-cream" />}>
          <DesktopApp />
        </Suspense>
      )}
    </ErrorBoundary>
  );
};
