// @vitest-environment jsdom

import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrailleLoader } from '../braille-loader';

describe('BrailleLoader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the first Braille frame on mount', () => {
    render(<BrailleLoader />);

    expect(screen.getByRole('status')).toHaveTextContent('⠋');
  });

  it('should cycle through frames over time', () => {
    render(<BrailleLoader />);
    const loader = screen.getByRole('status');

    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(loader).toHaveTextContent('⠙');

    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(loader).toHaveTextContent('⠹');
  });

  it('should loop back to first frame after the last', () => {
    render(<BrailleLoader />);
    const loader = screen.getByRole('status');

    act(() => {
      vi.advanceTimersByTime(80 * 10);
    });
    expect(loader).toHaveTextContent('⠋');
  });

  it('should apply size variant classes', () => {
    const { rerender } = render(<BrailleLoader size="sm" />);
    expect(screen.getByRole('status').className).toContain('text-sm');

    rerender(<BrailleLoader size="lg" />);
    expect(screen.getByRole('status').className).toContain('text-lg');
  });

  it('should accept custom className', () => {
    render(<BrailleLoader className="text-red-500" />);
    expect(screen.getByRole('status').className).toContain('text-red-500');
  });

  it('should have accessible role and label', () => {
    render(<BrailleLoader />);
    const loader = screen.getByRole('status');

    expect(loader).toHaveAttribute('aria-label', 'Loading');
  });
});
