import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLandingScroll } from '../../src/hooks/useLandingScroll';

describe('useLandingScroll hook', () => {
  it('initializes navTheme with sage by default', () => {
    const heroRef = { current: document.createElement('div') };
    const creamCurtainRef = { current: document.createElement('div') };
    const finalCtaRef = { current: document.createElement('div') };

    const { result } = renderHook(() =>
      useLandingScroll({
        heroRef,
        creamCurtainRef,
        finalCtaRef,
      })
    );

    expect(result.current.navTheme).toBe('sage');
  });

  it('respects prefers-reduced-motion without crashing', () => {
    // Mock matchMedia for prefers-reduced-motion
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const heroRef = { current: document.createElement('div') };
    const creamCurtainRef = { current: document.createElement('div') };
    const finalCtaRef = { current: document.createElement('div') };

    const { result, unmount } = renderHook(() =>
      useLandingScroll({
        heroRef,
        creamCurtainRef,
        finalCtaRef,
      })
    );

    expect(result.current.navTheme).toBe('sage');
    expect(() => unmount()).not.toThrow();
  });
});
