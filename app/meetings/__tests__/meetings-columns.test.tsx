// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  errorMessage: null,
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
      expect(screen.getByText('Failed to process meeting')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Ready')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('shows "Failed to process meeting" title for failed rows', () => {
      _renderTable([
        { ...baseMeeting, status: 'failed', errorMessage: 'API error' }
      ]);
      expect(screen.getByText('Failed to process meeting')).toBeInTheDocument();
      expect(screen.queryByText('Weekly Standup')).not.toBeInTheDocument();
    });

    it('renders error info icon for failed rows with errorMessage', () => {
      _renderTable([
        { ...baseMeeting, status: 'failed', errorMessage: 'API error' }
      ]);
      const icon = document.querySelector('svg.lucide-circle-alert');
      expect(icon).toBeInTheDocument();
    });

    it('does not render error icon for failed rows without errorMessage', () => {
      _renderTable([{ ...baseMeeting, status: 'failed', errorMessage: null }]);
      const icon = document.querySelector('svg.lucide-circle-alert');
      expect(icon).not.toBeInTheDocument();
    });

    it('does not render error icon for non-failed rows', () => {
      _renderTable([{ ...baseMeeting, status: 'ready' }]);
      const icon = document.querySelector('svg.lucide-circle-alert');
      expect(icon).not.toBeInTheDocument();
    });

    it('shows error message tooltip on hover over info icon', async () => {
      const user = userEvent.setup();
      _renderTable([
        {
          ...baseMeeting,
          status: 'failed',
          errorMessage: 'Quality check failed: not a real meeting'
        }
      ]);

      const icon = document.querySelector('svg.lucide-circle-alert') as Element;
      expect(icon).toBeInTheDocument();

      await user.hover(icon);

      await waitFor(() => {
        const matches = screen.getAllByText(
          'Quality check failed: not a real meeting'
        );
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
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
