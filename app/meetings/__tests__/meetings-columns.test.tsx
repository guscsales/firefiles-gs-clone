// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from '@/packages/ui/app-components/data-table';
import {
  type MeetingRow,
  meetingsColumns
} from '../_components/meetings-columns';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/meetings',
  useSearchParams: () => new URLSearchParams()
}));

const baseMeeting: MeetingRow = {
  id: 'test-id',
  title: 'Weekly Standup',
  status: 'processing',
  createdAt: '2026-05-16T12:00:00Z'
};

function _renderTable(data: MeetingRow[]) {
  return render(<DataTable columns={meetingsColumns} data={data} />);
}

describe('meetingsColumns', () => {
  it('defines three columns: title, status, createdAt', () => {
    const keys = meetingsColumns.map((c) =>
      'accessorKey' in c ? c.accessorKey : c.id
    );
    expect(keys).toEqual(['title', 'status', 'createdAt']);
  });

  it('title column is sortable', () => {
    const titleCol = meetingsColumns.find(
      (c) => 'accessorKey' in c && c.accessorKey === 'title'
    );
    expect(titleCol?.enableSorting).toBe(true);
  });

  it('status column is not sortable', () => {
    const statusCol = meetingsColumns.find(
      (c) => 'accessorKey' in c && c.accessorKey === 'status'
    );
    expect(statusCol?.enableSorting).toBe(false);
  });

  it('createdAt column is sortable', () => {
    const createdCol = meetingsColumns.find(
      (c) => 'accessorKey' in c && c.accessorKey === 'createdAt'
    );
    expect(createdCol?.enableSorting).toBe(true);
  });

  describe('rendered in DataTable', () => {
    it('renders meeting title', () => {
      _renderTable([baseMeeting]);
      expect(screen.getByText('Weekly Standup')).toBeInTheDocument();
    });

    it('renders Processing badge with braille loader', () => {
      _renderTable([{ ...baseMeeting, status: 'processing' }]);
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders Ready badge without braille loader', () => {
      _renderTable([{ ...baseMeeting, status: 'ready' }]);
      expect(screen.getByText('Ready')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('renders Failed badge without braille loader', () => {
      _renderTable([{ ...baseMeeting, status: 'failed' }]);
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('formats date as "MMM d, yyyy"', () => {
      _renderTable([baseMeeting]);
      expect(screen.getByText('May 16, 2026')).toBeInTheDocument();
    });

    it('renders multiple rows with different statuses', () => {
      _renderTable([
        { ...baseMeeting, id: '1', title: 'Meeting A', status: 'processing' },
        { ...baseMeeting, id: '2', title: 'Meeting B', status: 'ready' },
        { ...baseMeeting, id: '3', title: 'Meeting C', status: 'failed' }
      ]);

      expect(screen.getByText('Meeting A')).toBeInTheDocument();
      expect(screen.getByText('Meeting B')).toBeInTheDocument();
      expect(screen.getByText('Meeting C')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Ready')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      render(
        <DataTable
          columns={meetingsColumns}
          data={[]}
          emptyTitle="Upload a meeting to get started"
        />
      );
      expect(
        screen.getByText('Upload a meeting to get started')
      ).toBeInTheDocument();
    });
  });
});
