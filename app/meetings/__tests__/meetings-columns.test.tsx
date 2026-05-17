// @vitest-environment jsdom

import { flexRender } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  type MeetingRow,
  meetingsColumns
} from '../_components/meetings-columns';

function renderCell(columnId: string, row: MeetingRow) {
  const column = meetingsColumns.find(
    (c) =>
      c.id === columnId || ('accessorKey' in c && c.accessorKey === columnId)
  );
  if (!column?.cell) return null;

  const cellFn = column.cell;
  const context = {
    row: { original: row, id: '0' },
    getValue: () => row[columnId as keyof MeetingRow]
  };

  const element = flexRender(cellFn, context as never);
  return render(<>{element}</>);
}

const baseMeeting: MeetingRow = {
  id: 'test-id',
  title: 'Test Meeting',
  status: 'processing',
  createdAt: '2026-05-16T12:00:00Z'
};

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

  describe('title cell', () => {
    it('renders meeting title', () => {
      renderCell('title', baseMeeting);
      expect(screen.getByText('Test Meeting')).toBeInTheDocument();
    });
  });

  describe('status cell', () => {
    it('renders Processing badge with braille loader for processing status', () => {
      renderCell('status', { ...baseMeeting, status: 'processing' });
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders Ready badge for ready status', () => {
      renderCell('status', { ...baseMeeting, status: 'ready' });
      expect(screen.getByText('Ready')).toBeInTheDocument();
    });

    it('renders Failed badge for failed status', () => {
      renderCell('status', { ...baseMeeting, status: 'failed' });
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('does not render braille loader for ready status', () => {
      renderCell('status', { ...baseMeeting, status: 'ready' });
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('does not render braille loader for failed status', () => {
      renderCell('status', { ...baseMeeting, status: 'failed' });
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('createdAt cell', () => {
    it('formats date as "MMM d, yyyy"', () => {
      renderCell('createdAt', baseMeeting);
      expect(screen.getByText('May 16, 2026')).toBeInTheDocument();
    });
  });
});
