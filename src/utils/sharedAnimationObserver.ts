/**
 * Shared IntersectionObserver for pausing off-screen animations across the landing page.
 * Avoids creating multiple observers and unifies visibility & background-tab handling.
 */

type VisibilityCallback = (isVisible: boolean) => void;

const callbacks = new Map<Element, VisibilityCallback>();
let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver(): IntersectionObserver {
  if (!sharedObserver && typeof window !== 'undefined') {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cb = callbacks.get(entry.target);
          if (cb) {
            cb(entry.isIntersecting);
          }
        });
      },
      // Root margin of 100px so animations start slightly before scrolling into view
      { rootMargin: '100px 0px 100px 0px' }
    );
  }
  return sharedObserver!;
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    const isHidden = document.hidden;
    callbacks.forEach((cb, el) => {
      if (isHidden) {
        cb(false);
      } else {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight + 100 && rect.bottom > -100;
        cb(inView);
      }
    });
  });
}

/**
 * Registers an element to receive visibility change notifications.
 * Automatically handles window resize, scroll, tab blur/focus.
 */
export function observeAnimationVisibility(
  element: Element,
  callback: VisibilityCallback
): () => void {
  const observer = getSharedObserver();
  callbacks.set(element, callback);
  observer.observe(element);

  // Initial check
  if (typeof document !== 'undefined') {
    const rect = element.getBoundingClientRect();
    const inView = !document.hidden && rect.top < window.innerHeight + 100 && rect.bottom > -100;
    callback(inView);
  }

  return () => {
    observer.unobserve(element);
    callbacks.delete(element);
  };
}
