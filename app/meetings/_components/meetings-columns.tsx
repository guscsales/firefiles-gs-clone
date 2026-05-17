'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/packages/ui/core-components/badge';
import { BrailleLoader } from '@/packages/ui/core-components/braille-loader';

type MeetingRow = {
  id: string;
  title: string;
  status: 'processing' | 'ready' | 'failed';
  createdAt: string;
};

const statusConfig = {
  processing: {
    variant: 'secondary' as const,
    label: 'Processing'
  },
  ready: {
    variant: 'success' as const,
    label: 'Ready'
  },
  failed: {
    variant: 'destructive' as const,
    label: 'Failed'
  }
};

export const meetingsColumns: ColumnDef<MeetingRow, unknown>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-sans text-[0.8125rem] leading-4 text-foreground font-medium">
        {row.original.title}
      </span>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => {
      const config = statusConfig[row.original.status];
      return (
        <Badge variant={config.variant} size="sm">
          {row.original.status === 'processing' && <BrailleLoader size="sm" />}
          {config.label}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-sans text-[0.8125rem] leading-4 text-muted-foreground">
        {format(new Date(row.original.createdAt), 'MMM d, yyyy')}
      </span>
    )
  }
];

export type { MeetingRow };
