import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HowItWorksStory } from '../../src/components/landing/HowItWorksStory';

describe('HowItWorksStory Component', () => {
  it('renders section title and three steps with badges in sentence case', () => {
    render(<HowItWorksStory />);

    expect(screen.getByText('How it works')).toBeInTheDocument();
    expect(screen.getByText('Drop, sort, drag out.')).toBeInTheDocument();
    expect(screen.getByText('Drop your markdown in.')).toBeInTheDocument();
    expect(screen.getByText('Sort into drawers.')).toBeInTheDocument();
    expect(screen.getByText('Drop or copy anywhere.')).toBeInTheDocument();
  });

  it('renders all three free-scrolling scenes with cards, drawers, and replay controls', () => {
    render(<HowItWorksStory />);

    // Scene 1 elements
    expect(screen.getByText('Local-first drop target')).toBeInTheDocument();
    expect(screen.getAllByText('.cursorrules').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /replay scene 1/i })).toBeInTheDocument();

    // Scene 2 elements
    expect(screen.getByText('Agent rules')).toBeInTheDocument();
    expect(screen.getByText('Prompts')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /replay scene 2/i })).toBeInTheDocument();

    // Scene 3 elements
    expect(screen.getByRole('button', { name: /replay scene 3/i })).toBeInTheDocument();
    expect(screen.getByText(/Ask anything with prompt context/i)).toBeInTheDocument();
    expect(screen.getByText('### File: CLAUDE.md')).toBeInTheDocument();
  });

  it('allows switching copy format in Scene 3 and handles copy action', () => {
    render(<HowItWorksStory />);

    // Toggle copy mode to code block
    const codeblockToggle = screen.getByRole('button', { name: /code block/i });
    fireEvent.click(codeblockToggle);
    expect(screen.getByText(/```markdown/i)).toBeInTheDocument();

    // Toggle copy mode to raw
    const rawToggle = screen.getByRole('button', { name: /raw/i });
    fireEvent.click(rawToggle);
    expect(screen.getByText(/# Claude Project Memory & Rules/i)).toBeInTheDocument();

    // Test Copy format button
    const copyBtn = screen.getByRole('button', { name: /copy format/i });
    fireEvent.click(copyBtn);
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });
});
