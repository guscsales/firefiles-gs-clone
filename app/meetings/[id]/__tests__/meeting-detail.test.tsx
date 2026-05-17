// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({ id: 'meeting-1' })
}));

let queryClient: QueryClient;

function _renderWithProviders(ui: React.ReactNode) {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

const readyMeeting = {
  id: 'meeting-1',
  title: 'Sprint Planning Review',
  status: 'ready' as const,
  summary: 'Team discussed sprint goals and assigned tasks for the week.',
  actionItems: [{ text: 'Review PR #42' }, { text: 'Update documentation' }],
  transcriptOutput: {
    transcriptionText: 'Hello team...',
    segments: [
      {
        id: 0,
        start: 0,
        end: 12.5,
        text: 'Hello team, welcome to the meeting.'
      },
      {
        id: 1,
        start: 12.5,
        end: 28.3,
        text: 'Let us discuss the sprint goals.'
      },
      { id: 2, start: 65, end: 78, text: 'We need to review the pull request.' }
    ],
    durationSeconds: 190,
    detectedLanguage: 'english'
  },
  errorMessage: null,
  createdAt: '2026-05-17T01:00:00Z'
};

describe('MeetingDetail', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    queryClient?.clear();
  });

  it('shows loading skeleton initially', async () => {
    vi.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {}));

    const { MeetingDetail } = await import('../_components/meeting-detail');
    _renderWithProviders(<MeetingDetail id="meeting-1" />);

    expect(
      document.querySelector('[data-slot="skeleton"]')
    ).toBeInTheDocument();
  });

  it('shows not found message when meeting does not exist', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: [{ message: 'Not found' }] }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const { MeetingDetail } = await import('../_components/meeting-detail');
    _renderWithProviders(<MeetingDetail id="bad-id" />);

    expect(await screen.findByText('Meeting not found')).toBeInTheDocument();
  });

  it('renders meeting title when ready', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ meeting: readyMeeting }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const { MeetingDetail } = await import('../_components/meeting-detail');
    _renderWithProviders(<MeetingDetail id="meeting-1" />);

    expect(
      await screen.findByText('Sprint Planning Review')
    ).toBeInTheDocument();
  });

  it('renders Summary and Transcription tabs', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ meeting: readyMeeting }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const { MeetingDetail } = await import('../_components/meeting-detail');
    _renderWithProviders(<MeetingDetail id="meeting-1" />);

    expect(
      await screen.findByRole('tab', { name: 'Summary' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Transcription' })
    ).toBeInTheDocument();
  });

  it('shows summary text and action items on Summary tab', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ meeting: readyMeeting }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const { MeetingDetail } = await import('../_components/meeting-detail');
    _renderWithProviders(<MeetingDetail id="meeting-1" />);

    expect(
      await screen.findByText(
        'Team discussed sprint goals and assigned tasks for the week.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Review PR #42')).toBeInTheDocument();
    expect(screen.getByText('Update documentation')).toBeInTheDocument();
  });

  it('shows timestamped segments on Transcription tab', async () => {
    const user = userEvent.setup();

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ meeting: readyMeeting }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const { MeetingDetail } = await import('../_components/meeting-detail');
    _renderWithProviders(<MeetingDetail id="meeting-1" />);

    await screen.findByRole('tab', { name: 'Summary' });
    await user.click(screen.getByRole('tab', { name: 'Transcription' }));

    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('00:12')).toBeInTheDocument();
    expect(screen.getByText('01:05')).toBeInTheDocument();
    expect(
      screen.getByText('Hello team, welcome to the meeting.')
    ).toBeInTheDocument();
  });

  it('handles empty action items gracefully', async () => {
    const meetingNoItems = {
      ...readyMeeting,
      actionItems: []
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ meeting: meetingNoItems }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const { MeetingDetail } = await import('../_components/meeting-detail');
    _renderWithProviders(<MeetingDetail id="meeting-1" />);

    expect(await screen.findByText('No action items')).toBeInTheDocument();
  });
});
