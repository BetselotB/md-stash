import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MarqueeUseCases } from '../../src/components/landing/MarqueeUseCases';
import { Landing } from '../../src/routes/Landing';

describe('MarqueeUseCases & Final CTA', () => {
  it('renders dual marquee items in MarqueeUseCases', () => {
    render(<MarqueeUseCases />);
    expect(screen.getAllByText('CLAUDE.md').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('AGENTS.md').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('.cursorrules').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('notes.md').length).toBeGreaterThanOrEqual(1);
  });

  it('renders final CTA and forest footer with cropped wordmark in Landing', () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    expect(screen.getByText('Stash your first file.')).toBeInTheDocument();
    expect(screen.getAllByText('Open MDstash').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Organize and stash your markdown locally/)).toBeInTheDocument();
  });
});
