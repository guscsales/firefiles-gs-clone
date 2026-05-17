// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('nuqs', () => ({
  parseAsInteger: {
    withDefault: (val: number) => ({ defaultValue: val })
  },
  parseAsString: {
    withDefault: (val: string) => ({ defaultValue: val })
  },
  useQueryState: vi
    .fn()
    .mockImplementation((_key: string, opts?: { defaultValue?: unknown }) => {
      return [opts?.defaultValue ?? null, vi.fn()];
    })
}));

import { useMeetings } from '../_hooks/use-meetings';

let queryClient: QueryClient;

function _wrapper({ children }: { children: React.ReactNode }) {
  return QueryClientProvider({ client: queryClient, children });
}

describe('useMeetings', () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('fetches meetings and returns data', async () => {
    const mockData = {
      data: [
        {
          id: '1',
          title: 'Meeting 1',
          status: 'ready',
          createdAt: '2026-05-16T12:00:00Z'
        }
      ],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 }
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const { result } = renderHook(() => useMeetings(), { wrapper: _wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.meetings).toHaveLength(1);
    expect(result.current.meetings[0].title).toBe('Meeting 1');
    expect(result.current.pagination?.total).toBe(1);
  });

  it('returns empty array when no data', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { result } = renderHook(() => useMeetings(), { wrapper: _wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.meetings).toHaveLength(0);
  });

  it('returns error object on fetch failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('', { status: 500 })
    );

    const { result } = renderHook(() => useMeetings(), { wrapper: _wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.error?.title).toBe('Failed to load meetings');
  });

  it('provides sorting state defaulting to createdAt desc', () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { result } = renderHook(() => useMeetings(), { wrapper: _wrapper });

    expect(result.current.sorting).toEqual([{ id: 'createdAt', desc: true }]);
  });

  it('exposes onSortingChange and onPageChange functions', () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { result } = renderHook(() => useMeetings(), { wrapper: _wrapper });

    expect(result.current.onSortingChange).toBeTypeOf('function');
    expect(result.current.onPageChange).toBeTypeOf('function');
  });
});
