// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '../alert';

describe('Alert', () => {
  it('renders title, description, action and the data-variant attribute (default)', () => {
    render(
      <Alert>
        <svg data-testid="icon" />
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Body copy</AlertDescription>
        <AlertAction>Learn more</AlertAction>
      </Alert>
    );

    const root = screen.getByRole('alert');
    expect(root).toHaveAttribute('data-variant', 'default');
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body copy')).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it.each([
    'default',
    'info',
    'success',
    'warning',
    'destructive'
  ] as const)('sets data-variant="%s" and tints children via context', (variant) => {
    render(
      <Alert variant={variant}>
        <AlertTitle>{variant} title</AlertTitle>
        <AlertDescription>{variant} body</AlertDescription>
        <AlertAction>{variant} action</AlertAction>
      </Alert>
    );

    const root = screen.getByRole('alert');
    expect(root).toHaveAttribute('data-variant', variant);

    const action = screen.getByText(`${variant} action`);
    expect(action).toHaveAttribute('data-slot', 'alert-action');

    const isPill = variant === 'warning' || variant === 'destructive';
    if (isPill) {
      expect(action.className).toMatch(/rounded-\[0\.4375rem\]/);
      expect(action.className).toMatch(/py-1\.5/);
      expect(action.className).toMatch(/px-2\.5/);
      expect(action.className).toMatch(
        new RegExp(`bg-\\[var\\(--alert-${variant}-action-bg\\)\\]`)
      );
    } else {
      expect(action.className).toMatch(/text-decoration:underline/);
      expect(action.className).toMatch(/underline-offset-\[3px\]/);
    }
  });

  it('AlertAction outside an Alert falls back to default variant', () => {
    render(<AlertAction>orphan</AlertAction>);
    const action = screen.getByText('orphan');
    expect(action.className).toMatch(/text-decoration:underline/);
    expect(action.className).toMatch(
      /text-\[var\(--alert-default-action-fg\)\]/
    );
  });
});
