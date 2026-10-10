// Performance ablation helper for measuring landing page performance
// Only active when import.meta.env.DEV or when ?perf is present in URL.

export const isPerfAllowed = Boolean(
  (import.meta as any).env?.DEV ||
  (typeof window !== 'undefined' && window.location.search.includes('perf'))
);

export function getPerfFlags(): Set<string> {
  if (!isPerfAllowed || typeof window === 'undefined') return new Set();
  const params = new URLSearchParams(window.location.search);
  const perf = params.get('perf');
  if (!perf) return new Set();
  return new Set(
    perf
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

// Global render counter for measuring zero re-renders during scroll
if (typeof window !== 'undefined') {
  const win = window as any;
  if (win.__reactRenderCount === undefined) {
    win.__reactRenderCount = 0;
  }
}

export function trackRender(componentName?: string): void {
  if (typeof window !== 'undefined') {
    const win = window as any;
    win.__reactRenderCount = (win.__reactRenderCount || 0) + 1;
    if (componentName) {
      win.__componentRenders = win.__componentRenders || {};
      win.__componentRenders[componentName] = (win.__componentRenders[componentName] || 0) + 1;
    }
  }
}

export function initPerfFlags(): void {
  if (!isPerfAllowed || typeof window === 'undefined') return;
  const flags = getPerfFlags();

  // Expose diagnostic query helper
  const win = window as any;
  win.__getRunningStats = () => {
    const ScrollTrigger = (win.gsap?.plugins?.ScrollTrigger || win.ScrollTrigger);
    const triggers = ScrollTrigger ? ScrollTrigger.getAll() : [];
    const activeTriggers = triggers.filter((t: any) => t.isActive);

    const activeTweens = win.gsap?.globalTimeline
      ? win.gsap.globalTimeline.getChildren(true, true, false).filter((t: any) => t.isActive && t.isActive())
      : [];

    const webAnimations = document.getAnimations ? document.getAnimations() : [];

    return {
      scrollTriggerTotal: triggers.length,
      scrollTriggerActive: activeTriggers.length,
      activeTriggersList: activeTriggers.map((t: any) => t.vars?.id || t.trigger?.id || t.trigger?.className || 'anon'),
      activeTweensCount: activeTweens.length,
      webAnimationsCount: webAnimations.length,
      reactRenderCount: win.__reactRenderCount || 0,
      componentRenders: win.__componentRenders || {},
    };
  };

  if (flags.size === 0) return;

  const style = document.createElement('style');
  style.id = 'perf-ablation-styles';
  let css = '';

  if (flags.has('nograin')) {
    css += `
      .grain-overlay { display: none !important; }
    `;
  }
  if (flags.has('noblend')) {
    css += `
      .grain-overlay::before, .grain-overlay::after { mix-blend-mode: normal !important; }
    `;
  }
  if (flags.has('noglass')) {
    css += `
      .nav-glass {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
    `;
  }
  if (flags.has('noshadow')) {
    css += `
      [data-panel] > div, .s1-card, .s2-drawer, .s3-editor, [data-card], .shadow-card, .shadow-md, .shadow-sm {
        box-shadow: none !important;
        filter: none !important;
      }
    `;
  }
  if (flags.has('nopath')) {
    css += `
      #how-it-works svg { display: none !important; }
      #hiw-line-1, #hiw-line-2, #hiw-marker { display: none !important; }
    `;
  }
  if (flags.has('noanims')) {
    css += `
      *, *::before, *::after {
        animation: none !important;
        animation-play-state: paused !important;
        transition: none !important;
      }
    `;
    setTimeout(() => {
      try {
        if (win.gsap) win.gsap.globalTimeline.pause();
      } catch {}
    }, 50);
  }

  if (css) {
    style.textContent = css;
    document.head.appendChild(style);
  }
}
