'use client';

import { useQuery } from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import type { MeetingRow } from '../_components/meetings-columns';

type MeetingsResponse = {
  data: MeetingRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

async function _fetchMeetings(params: {
  page: number;
  sortBy: string;
  sortOrder: string;
  search?: string;
}): Promise<MeetingsResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder
  });

  if (params.search) {
    searchParams.set('search', params.search);
  }

  const response = await fetch(`/api/meetings?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch meetings');
  }

  return response.json();
}

export function useMeetings() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState(
    'sortBy',
    parseAsString.withDefault('createdAt')
  );
  const [sortOrder, setSortOrder] = useQueryState(
    'sortOrder',
    parseAsString.withDefault('desc')
  );
  const [search] = useQueryState('search', parseAsString);

  const { data, isLoading, error } = useQuery({
    queryKey: ['meetings', { page, sortBy, sortOrder, search }],
    queryFn: () =>
      _fetchMeetings({
        page,
        sortBy,
        sortOrder,
        search: search ?? undefined
      }),
    refetchInterval: (query) => {
      const meetings = query.state.data?.data;
      if (!meetings) return false;
      const hasProcessing = meetings.some((m) => m.status === 'processing');
      return hasProcessing ? 5000 : false;
    }
  });

  const sorting: SortingState = [{ id: sortBy, desc: sortOrder === 'desc' }];

  function onSortingChange(
    updater: SortingState | ((prev: SortingState) => SortingState)
  ) {
    const next = typeof updater === 'function' ? updater(sorting) : updater;
    if (next.length > 0) {
      const col = next[0];
      setSortBy(col.id);
      setSortOrder(col.desc ? 'desc' : 'asc');
      setPage(1);
    }
  }

  function onPageChange(newPage: number) {
    setPage(newPage);
  }

  return {
    meetings: data?.data ?? [],
    pagination: data?.pagination,
    sorting,
    isLoading,
    error: error
      ? { title: 'Failed to load meetings', description: error.message }
      : undefined,
    onSortingChange,
    onPageChange
  };
}
