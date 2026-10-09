import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HeroSection } from '../../src/components/landing/HeroSection';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HeroSection Component', () => {
  it('renders simplified headline in 2 lines in sentence case', () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('aria-label', 'Your markdown, stashed.');
    expect(screen.getByText('markdown')).toBeInTheDocument();
    expect(screen.getByText('stashed.')).toBeInTheDocument();
  });

  it('renders rotating circular badge with seamless text and down arrow', () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/scroll to how it works/i)).toBeInTheDocument();
    expect(screen.getByText(/private & honest · local first ·/i)).toBeInTheDocument();
  });

  it('renders markdown bottom motifs: asterisk and prompt mark with captions', () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    expect(screen.getByLabelText('Markdown asterisk motif')).toBeInTheDocument();
    expect(screen.getByLabelText('Markdown prompt motif')).toBeInTheDocument();
    expect(screen.getByText('Zero cloud')).toBeInTheDocument();
    expect(screen.getByText('zero servers')).toBeInTheDocument();
    expect(screen.getByText('Works offline')).toBeInTheDocument();
  });

  it('renders fixed right-edge protruding tab and handles click navigation', async () => {
    vi.useFakeTimers();
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    const rightTab = screen.getByRole('button', { name: /open mdstash/i });
    expect(rightTab).toBeInTheDocument();

    fireEvent.click(rightTab);

    // After animation delay, navigates to /app
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/app');
    vi.useRealTimers();
  });

  it('handles interactive bottom center crate click and keyboard navigation', async () => {
    vi.useFakeTimers();
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    const crate = screen.getByLabelText(/interactive mdstash crate/i);
    expect(crate).toBeInTheDocument();

    fireEvent.keyDown(crate, { key: 'Enter' });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/app');
    vi.useRealTimers();
  });
});
