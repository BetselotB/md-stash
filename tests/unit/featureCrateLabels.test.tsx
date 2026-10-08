import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FeatureCrateLabels } from '../../src/components/landing/FeatureCrateLabels';

describe('FeatureCrateLabels Component', () => {
  it('renders all 5 craft labels with proper names and promises', () => {
    render(<FeatureCrateLabels />);
    expect(screen.getByText('The Binder')).toBeInTheDocument();
    expect(screen.getByText('The Polyglot')).toBeInTheDocument();
    expect(screen.getByText('The Hound')).toBeInTheDocument();
    expect(screen.getByText('The Time Machine')).toBeInTheDocument();
    expect(screen.getByText('The Hermit')).toBeInTheDocument();

    expect(screen.getByText('Zero copy-paste fragmentation')).toBeInTheDocument();
    expect(screen.getByText('Ready for every chat prompt')).toBeInTheDocument();
    expect(screen.getByText('Sub-millisecond fuzzy search')).toBeInTheDocument();
    expect(screen.getByText('Zero lost changes, ever')).toBeInTheDocument();
    expect(screen.getByText('Runs on airplanes and cabins')).toBeInTheDocument();
  });

  it('allows switching copy modes in The Polyglot', () => {
    render(<FeatureCrateLabels />);
    const rawBtn = screen.getByRole('button', { name: /raw/i });
    const codeBtn = screen.getByRole('button', { name: /code/i });

    fireEvent.click(rawBtn);
    expect(screen.getByText(/You are an expert engineer/)).toBeInTheDocument();

    fireEvent.click(codeBtn);
    expect(screen.getByText(/```markdown/)).toBeInTheDocument();
  });

  it('filters search results dynamically in The Hound', () => {
    render(<FeatureCrateLabels />);
    const input = screen.getByPlaceholderText('Type to filter...');
    fireEvent.change(input, { target: { value: 'api' } });
    expect(screen.getByText('api-notes.md')).toBeInTheDocument();
    expect(screen.getAllByText('#notes').length).toBeGreaterThanOrEqual(1);
  });

  it('scrubs versions in The Time Machine', () => {
    render(<FeatureCrateLabels />);
    const slider = screen.getByLabelText('Version history slider');
    fireEvent.change(slider, { target: { value: '0' } });
    expect(screen.getByText('v1.0')).toBeInTheDocument();
    expect(screen.getByText(/10 mins ago/)).toBeInTheDocument();
  });

  it('toggles network status in The Hermit', () => {
    render(<FeatureCrateLabels />);
    const statusBtn = screen.getByRole('button', { name: /online/i });
    fireEvent.click(statusBtn);
    expect(screen.getByText('Airplane Mode')).toBeInTheDocument();
  });
});
