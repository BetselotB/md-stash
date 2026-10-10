import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DesktopGate } from '../../src/components/gate/DesktopGate';

describe('DesktopGate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders fixed size badge, headline, and reassurance text', () => {
    render(<DesktopGate />);

    expect(screen.getByTestId('gate-badge')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('MDstash lives on the desktop.');
    expect(
      screen.getByText('No account, no tracking. Your files never leave your device.')
    ).toBeInTheDocument();
  });

  it('copies current URL to clipboard on Copy link click and displays Copied', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<DesktopGate />);
    const copyButton = screen.getByRole('button', { name: /copy website link/i });
    expect(copyButton).toHaveTextContent('Copy link');

    fireEvent.click(copyButton);

    expect(writeTextMock).toHaveBeenCalled();
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });

  it('renders a secondary email mailto link with prefilled subject', () => {
    render(<DesktopGate />);
    const emailLink = screen.getByRole('link', { name: /email link to myself/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.getAttribute('href')).toContain('mailto:?subject=MDstash');
  });
});
