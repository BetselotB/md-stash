import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LandingNav } from '../../src/components/landing/LandingNav';
import { MenuOverlay } from '../../src/components/landing/MenuOverlay';

describe('Landing Navigation & Menu Overlay', () => {
  it('renders desktop three-zone layout correctly in LandingNav', () => {
    render(
      <BrowserRouter>
        <LandingNav />
      </BrowserRouter>
    );

    // Zone 1: Left
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByTitle('GitHub repository')).toBeInTheDocument();
    expect(screen.getByTitle('Back to top')).toBeInTheDocument();

    // Zone 2: Center hanging double-line framed badge
    expect(screen.getByTitle('MDstash Home')).toBeInTheDocument();
    expect(screen.getByTestId('badge-tab')).toHaveTextContent(/md/i);

    // Zone 3: Right
    expect(screen.getByRole('button', { name: /open mdstash/i })).toBeInTheDocument();
    expect(screen.getByTitle('Privacy policy')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it('opens and closes MenuOverlay via Escape key', () => {
    const handleClose = vi.fn();
    const handleNav = vi.fn();

    const { rerender } = render(
      <BrowserRouter>
        <MenuOverlay isOpen={true} onClose={handleClose} onNavigateSection={handleNav} />
      </BrowserRouter>
    );

    expect(screen.getByRole('dialog', { name: /navigation menu/i })).toBeInTheDocument();
    expect(screen.getByText('How it works')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();

    // Test Escape key closes overlay
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();

    // When closed, dialog is removed
    rerender(
      <BrowserRouter>
        <MenuOverlay isOpen={false} onClose={handleClose} onNavigateSection={handleNav} />
      </BrowserRouter>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
