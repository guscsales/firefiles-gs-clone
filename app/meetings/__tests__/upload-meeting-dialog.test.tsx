// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadMeetingDialog } from '../_components/upload-meeting-dialog';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/meetings',
  useSearchParams: () => new URLSearchParams()
}));

let queryClient: QueryClient;

function _renderWithProviders(ui: React.ReactNode) {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('UploadMeetingDialog', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    queryClient?.clear();
  });

  it('renders trigger button with "Upload meeting" text', () => {
    _renderWithProviders(<UploadMeetingDialog />);
    expect(screen.getByText('Upload meeting')).toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    const user = userEvent.setup();
    _renderWithProviders(<UploadMeetingDialog />);

    await user.click(screen.getByText('Upload meeting'));

    expect(
      screen.getByText('Upload an audio or video file to transcribe.')
    ).toBeInTheDocument();
    expect(screen.getByText('Recording file')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('has upload button disabled when no file is selected', async () => {
    const user = userEvent.setup();
    _renderWithProviders(<UploadMeetingDialog />);

    await user.click(screen.getByText('Upload meeting'));

    const uploadBtn = screen.getByRole('button', { name: 'Upload' });
    expect(uploadBtn).toBeDisabled();
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    _renderWithProviders(<UploadMeetingDialog />);

    await user.click(screen.getByText('Upload meeting'));
    expect(
      screen.getByText('Upload an audio or video file to transcribe.')
    ).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(
      screen.queryByText('Upload an audio or video file to transcribe.')
    ).not.toBeInTheDocument();
  });

  it('calls fetch with FormData on successful submit', async () => {
    const mockFetch = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ meeting: { id: 'new-id', status: 'processing' } }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      );

    const user = userEvent.setup();
    _renderWithProviders(<UploadMeetingDialog />);

    await user.click(screen.getByText('Upload meeting'));

    const fileInput = document.querySelector(
      'input[type="file"], button[type="file"]'
    );
    if (!fileInput) throw new Error('File input not found');

    const file = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });
    await user.upload(fileInput as HTMLInputElement, file);

    const uploadBtn = screen.getByRole('button', { name: 'Upload' });
    await user.click(uploadBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/meetings', {
        method: 'POST',
        body: expect.any(FormData)
      });
    });
  });

  it('closes dialog after successful upload', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ meeting: { id: 'new-id', status: 'processing' } }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const user = userEvent.setup();
    _renderWithProviders(<UploadMeetingDialog />);

    await user.click(screen.getByText('Upload meeting'));

    const fileInput = document.querySelector(
      'input[type="file"], button[type="file"]'
    );
    if (!fileInput) throw new Error('File input not found');

    const file = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });
    await user.upload(fileInput as HTMLInputElement, file);

    await user.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(
        screen.queryByText('Upload an audio or video file to transcribe.')
      ).not.toBeInTheDocument();
    });
  });

  // Error handling tested in use-meeting.test.ts — startTransition rethrows
  // mutation errors which unmounts the component tree in test env.
});
