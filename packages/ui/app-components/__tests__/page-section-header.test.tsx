// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageSectionHeader } from '../page-section-header';

describe('PageSectionHeader', () => {
  it('renders title as h1', () => {
    render(<PageSectionHeader title="Users" />);
    const heading = screen.getByRole('heading', { level: 1, name: 'Users' });
    expect(heading).toBeInTheDocument();
  });

  it('renders eyebrow, description and actions when provided', () => {
    render(
      <PageSectionHeader
        eyebrow="Workspace / Users"
        title="Users"
        description="Manage every member."
        actions={<button type="button">Add User</button>}
      />
    );

    expect(screen.getByText('Workspace / Users')).toBeInTheDocument();
    expect(screen.getByText('Manage every member.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add User' })
    ).toBeInTheDocument();
  });

  it('omits eyebrow, description and actions when not provided', () => {
    const { container } = render(<PageSectionHeader title="Plain" />);
    expect(screen.getByRole('heading', { name: 'Plain' })).toBeInTheDocument();
    expect(container.querySelectorAll('p').length).toBe(0);
    expect(container.querySelectorAll('button').length).toBe(0);
  });
});
