import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { InteractivePlayground } from '../../src/components/landing/InteractivePlayground';

describe('InteractivePlayground Component', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders sample files and default prompt format', () => {
    render(<InteractivePlayground />);
    expect(screen.getAllByText('CLAUDE.md').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('AGENTS.md').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('.cursorrules')).toBeInTheDocument();

    expect(screen.getByText(/File: CLAUDE.md/)).toBeInTheDocument();
  });

  it('switches between Raw, Code block, and Prompt-ready modes', () => {
    render(<InteractivePlayground />);

    const rawBtn = screen.getByRole('button', { name: /^raw$/i });
    fireEvent.click(rawBtn);
    expect(screen.getByText(/# Claude Guidelines/)).toBeInTheDocument();
    expect(screen.queryByText(/File: CLAUDE.md/)).not.toBeInTheDocument();

    const codeBtn = screen.getByRole('button', { name: /^code block$/i });
    fireEvent.click(codeBtn);
    expect(screen.getByText(/```markdown/)).toBeInTheDocument();
  });

  it('copies formatted text to clipboard and shows feedback', async () => {
    render(<InteractivePlayground />);
    const copyBtn = screen.getByRole('button', { name: /copy to clipboard/i });
    fireEvent.click(copyBtn);

    expect(await screen.findByText('Copied to clipboard!')).toBeInTheDocument();
  });

  it('allows selecting different sample files', () => {
    render(<InteractivePlayground />);
    const agentsBtn = screen.getByRole('button', { name: /AGENTS.md/i });
    fireEvent.click(agentsBtn);

    expect(screen.getByText(/File: AGENTS.md/)).toBeInTheDocument();
    expect(screen.getAllByText(/Multi-agent orchestration/).length).toBeGreaterThanOrEqual(1);
  });

  it('handles drag-and-drop into the fake chat box', () => {
    render(<InteractivePlayground />);
    const dropZone = screen.getByText(/Hello! Drag a file chip/i).closest('div')?.parentElement;
    expect(dropZone).toBeInTheDocument();

    if (dropZone) {
      fireEvent.drop(dropZone, {
        dataTransfer: {
          getData: () => '# Dropped Content',
        },
      });

      expect(screen.getByText('# Dropped Content')).toBeInTheDocument();
      expect(screen.getByText(/Got context from CLAUDE.md!/)).toBeInTheDocument();
    }
  });
});
