import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HowItWorksStory } from '../../src/components/landing/HowItWorksStory';

describe('HowItWorksStory Component', () => {
  it('renders section title and three steps with badges in sentence case', () => {
    render(<HowItWorksStory />);

    expect(screen.getByText('How MDstash works')).toBeInTheDocument();
    expect(screen.getByText('Drop your markdown in.')).toBeInTheDocument();
    expect(screen.getByText('Sort into color drawers.')).toBeInTheDocument();
    expect(screen.getByText('Drop or copy anywhere.')).toBeInTheDocument();
  });

  it('renders Step 1 Drop zone by default with falling files', () => {
    render(<HowItWorksStory />);

    expect(screen.getByText('Drop markdown files here')).toBeInTheDocument();
    expect(screen.getByText('CLAUDE.md')).toBeInTheDocument();
    expect(screen.getByText('AGENTS.md')).toBeInTheDocument();
    expect(screen.getByText('.cursorrules')).toBeInTheDocument();
  });

  it('switches to Step 2 Sort and reveals color drawers', () => {
    render(<HowItWorksStory />);

    const step2Button = screen.getByText('Sort into color drawers.');
    fireEvent.click(step2Button);

    expect(screen.getByText('Agent rules')).toBeInTheDocument();
    expect(screen.getByText('Prompts')).toBeInTheDocument();
    expect(screen.getByText('Notes & Starters')).toBeInTheDocument();
  });

  it('switches to Step 3 Drop Anywhere and allows copy mode toggle', () => {
    render(<HowItWorksStory />);

    const step3Button = screen.getByText('Drop or copy anywhere.');
    fireEvent.click(step3Button);

    // Shows mock editor and chat input
    expect(screen.getByText(/Ask Claude or Cursor/i)).toBeInTheDocument();
    expect(screen.getByText('### File: CLAUDE.md')).toBeInTheDocument();

    // Toggle copy mode to codeblock
    const codeblockToggle = screen.getByRole('button', { name: /codeblock/i });
    fireEvent.click(codeblockToggle);
    expect(screen.getByText('```markdown')).toBeInTheDocument();

    // Test Copy format button
    const copyBtn = screen.getByRole('button', { name: /copy format/i });
    fireEvent.click(copyBtn);
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });
});
