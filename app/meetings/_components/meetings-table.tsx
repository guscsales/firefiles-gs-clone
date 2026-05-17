'use client';

import { DataTable } from '@/packages/ui/app-components/data-table';
import { useMeetings } from '../_hooks/use-meetings';
import { meetingsColumns } from './meetings-columns';

export function MeetingsTable() {
  const {
    meetings,
    pagination,
    sorting,
    isLoading,
    error,
    onSortingChange,
    onPageChange
  } = useMeetings();

  return (
    <DataTable
      columns={meetingsColumns}
      data={meetings}
      pagination={pagination}
      sorting={sorting}
      onSortingChange={onSortingChange}
      onPageChange={onPageChange}
      isLoading={isLoading}
      error={error}
      emptyTitle="Upload a meeting to get started"
    />
  );
}
