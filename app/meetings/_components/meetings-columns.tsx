'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CircleAlert } from 'lucide-react';
import { Badge } from '@/packages/ui/core-components/badge';
import { BrailleLoader } from '@/packages/ui/core-components/braille-loader';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/packages/ui/core-components/tooltip';

type MeetingRow = {
  id: string;
  title: string;
  status: 'processing' | 'ready' | 'failed';
  errorMessage: string | null;
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
    cell: ({ row }) => {
      const isFailed = row.original.status === 'failed';
      const title = isFailed ? 'Failed to process meeting' : row.original.title;
      return (
        <span className="inline-flex items-center gap-1.5 font-sans text-[0.8125rem] leading-4 text-foreground font-medium">
          {title}
          {isFailed && row.original.errorMessage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <CircleAlert className="size-3.5 text-destructive cursor-pointer shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                {row.original.errorMessage}
              </TooltipContent>
            </Tooltip>
          )}
        </span>
      );
    }
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
