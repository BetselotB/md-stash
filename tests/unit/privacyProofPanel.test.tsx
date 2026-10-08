import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PrivacyProofPanel } from '../../src/components/landing/PrivacyProofPanel';

describe('PrivacyProofPanel Component', () => {
  beforeEach(() => {
    Object.assign(window.performance, {
      getEntriesByType: vi.fn().mockReturnValue([
        {
          name: 'http://localhost:5173/src/main.tsx',
          initiatorType: 'script',
          duration: 12.4,
          transferSize: 450,
        },
        {
          name: 'http://localhost:5173/@fontsource/passion-one/latin.woff2',
          initiatorType: 'fetch',
          duration: 5.2,
          transferSize: 18200,
        },
      ]),
    });
  });

  it('renders the verification stamp with 0 requests with your files', () => {
    render(<PrivacyProofPanel />);
    expect(screen.getByText('0 requests')).toBeInTheDocument();
    expect(screen.getByText('with your files')).toBeInTheDocument();
    expect(screen.getByText(/Open DevTools > Network and try it yourself/)).toBeInTheDocument();
  });

  it('reads performance resource timings and lists static assets', () => {
    render(<PrivacyProofPanel />);
    expect(screen.getByText('main.tsx')).toBeInTheDocument();
    expect(screen.getByText('latin.woff2')).toBeInTheDocument();
    expect(screen.getByText(/File upload calls:/)).toBeInTheDocument();
  });

  it('allows manual rescanning of resources', () => {
    render(<PrivacyProofPanel />);
    const scanBtn = screen.getByRole('button', { name: /scan/i });
    fireEvent.click(scanBtn);
    expect(window.performance.getEntriesByType).toHaveBeenCalledWith('resource');
  });
});
