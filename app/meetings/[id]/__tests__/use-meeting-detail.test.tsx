import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMeetingDetail } from '../_hooks/use-meeting-detail';

function _createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useMeetingDetail', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches meeting by id', async () => {
    const meeting = {
      id: 'meeting-1',
      title: 'Sprint Planning',
      status: 'ready',
      summary: 'Discussed goals',
      actionItems: [{ text: 'Review PR' }]
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ meeting }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const { result } = renderHook(() => useMeetingDetail('meeting-1'), {
      wrapper: _createWrapper()
    });

    await waitFor(() => {
      expect(result.current.meeting).toBeDefined();
    });

    expect(result.current.meeting?.title).toBe('Sprint Planning');
    expect(global.fetch).toHaveBeenCalledWith('/api/meetings/meeting-1');
  });

  it('returns notFound true when API returns 404', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: [{ message: 'Not found' }] }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const { result } = renderHook(() => useMeetingDetail('bad-id'), {
      wrapper: _createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notFound).toBe(true);
    expect(result.current.meeting).toBeUndefined();
  });

  it('returns isLoading true initially', () => {
    vi.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useMeetingDetail('meeting-1'), {
      wrapper: _createWrapper()
    });

    expect(result.current.isLoading).toBe(true);
  });
});
