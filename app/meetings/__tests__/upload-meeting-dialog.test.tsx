// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UploadMeetingDialog } from '../_components/upload-meeting-dialog';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/meetings',
  useSearchParams: () => new URLSearchParams()
}));

function _renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('UploadMeetingDialog', () => {
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
});
