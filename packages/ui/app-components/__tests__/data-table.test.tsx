// @vitest-environment jsdom

import type { ColumnDef } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from '../data-table';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

type TestRow = { id: string; name: string; email: string };

const columns: ColumnDef<TestRow>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' }
];

const testData: TestRow[] = [
  { id: '1', name: 'Alice', email: 'alice@test.com' },
  { id: '2', name: 'Bob', email: 'bob@test.com' }
];

describe('DataTable', () => {
  it('should render column headers', () => {
    render(<DataTable columns={columns} data={testData} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should render data rows', () => {
    render(<DataTable columns={columns} data={testData} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    render(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('should show skeleton rows when loading', () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} isLoading />
    );

    const skeletonRows = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletonRows.length).toBeGreaterThan(0);
  });

  it('should render pagination when provided', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        pagination={{ page: 1, pageSize: 20, total: 50, totalPages: 3 }}
      />
    );

    expect(screen.getByText('50 results')).toBeInTheDocument();
  });

  it('should show singular result text for 1 total', () => {
    render(
      <DataTable
        columns={columns}
        data={testData.slice(0, 1)}
        pagination={{ page: 1, pageSize: 20, total: 1, totalPages: 1 }}
      />
    );

    expect(screen.getByText('1 result')).toBeInTheDocument();
  });

  it('should not render pagination controls for single page', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        pagination={{ page: 1, pageSize: 20, total: 2, totalPages: 1 }}
      />
    );

    // Result count shown but no page buttons
    expect(screen.getByText('2 results')).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('should call onPageChange when clicking page buttons', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <DataTable
        columns={columns}
        data={testData}
        pagination={{ page: 1, pageSize: 20, total: 100, totalPages: 5 }}
        onPageChange={onPageChange}
      />
    );

    // Click page 2
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should disable previous buttons on first page', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        pagination={{ page: 1, pageSize: 20, total: 100, totalPages: 5 }}
      />
    );

    const buttons = screen.getAllByRole('button');
    // First two buttons (first page + prev) should be disabled
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it('should disable next buttons on last page', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        pagination={{ page: 5, pageSize: 20, total: 100, totalPages: 5 }}
      />
    );

    const buttons = screen.getAllByRole('button');
    const lastButton = buttons[buttons.length - 1];
    const secondLastButton = buttons[buttons.length - 2];
    expect(lastButton).toBeDisabled();
    expect(secondLastButton).toBeDisabled();
  });
});
