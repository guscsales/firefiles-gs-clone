// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMeeting } from '../_hooks/use-meeting';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/meetings',
  useSearchParams: () => new URLSearchParams()
}));

let queryClient: QueryClient;

function _wrapper({ children }: { children: React.ReactNode }) {
  return QueryClientProvider({ client: queryClient, children });
}

describe('useMeeting', () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('returns uploadMeeting function and isPendingUploadMeeting', () => {
    const { result } = renderHook(() => useMeeting(), { wrapper: _wrapper });

    expect(result.current.uploadMeeting).toBeTypeOf('function');
    expect(result.current.isPendingUploadMeeting).toBe(false);
  });

  it('calls fetch with FormData on uploadMeeting', async () => {
    const mockFetch = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ meeting: { id: '1', status: 'processing' } }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      );

    const { result } = renderHook(() => useMeeting(), { wrapper: _wrapper });

    const formData = new FormData();
    formData.append(
      'file',
      new File(['audio'], 'test.mp3', { type: 'audio/mpeg' })
    );

    await result.current.uploadMeeting(formData);

    expect(mockFetch).toHaveBeenCalledWith('/api/meetings', {
      method: 'POST',
      body: formData
    });
  });

  it('invalidates meetings query on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ meeting: { id: '1', status: 'processing' } }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useMeeting(), { wrapper: _wrapper });

    const formData = new FormData();
    formData.append(
      'file',
      new File(['audio'], 'test.mp3', { type: 'audio/mpeg' })
    );

    await result.current.uploadMeeting(formData);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['meetings']
      });
    });
  });

  it('throws error with message from API on failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: [{ path: ['file'], message: 'File too large' }]
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { result } = renderHook(() => useMeeting(), { wrapper: _wrapper });

    const formData = new FormData();
    formData.append(
      'file',
      new File(['big'], 'big.mp3', { type: 'audio/mpeg' })
    );

    await expect(result.current.uploadMeeting(formData)).rejects.toThrow(
      'File too large'
    );
  });
});
