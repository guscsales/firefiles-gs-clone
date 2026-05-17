import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetMeetingById = vi.fn();
const mockWaitUntil = vi.fn();
const mockProcessMeetingTranscript = vi.fn();

vi.mock('@/packages/factory/meetings/services/meeting-service', () => ({
  getMeetingById: (...args: unknown[]) => mockGetMeetingById(...args)
}));

vi.mock('@/packages/factory/meetings/services/meeting-ai-service', () => ({
  processMeetingTranscript: (...args: unknown[]) =>
    mockProcessMeetingTranscript(...args)
}));

vi.mock('@vercel/functions', () => ({
  waitUntil: (...args: unknown[]) => mockWaitUntil(...args)
}));

describe('POST /api/meetings/[id]/process', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function _createRequest() {
    return new Request('http://localhost/api/meetings/meeting-1/process', {
      method: 'POST'
    });
  }

  it('returns 202 and triggers processing in background', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      status: 'processing',
      errorMessage: 'previous error',
      transcriptOutput: {
        transcriptionText: 'Hello world',
        segments: [],
        durationSeconds: 60,
        detectedLanguage: 'en'
      }
    });

    const { POST } = await import('@/app/api/meetings/[id]/process/route');
    const response = await POST(_createRequest(), {
      params: Promise.resolve({ id: 'meeting-1' })
    });

    expect(response.status).toBe(202);
    const body = await response.json();
    expect(body.meeting.id).toBe('meeting-1');
    expect(mockWaitUntil).toHaveBeenCalledOnce();
    expect(mockProcessMeetingTranscript).toHaveBeenCalledWith('meeting-1');
  });

  it('returns 404 when meeting does not exist', async () => {
    mockGetMeetingById.mockResolvedValue(null);

    const { POST } = await import('@/app/api/meetings/[id]/process/route');
    const response = await POST(_createRequest(), {
      params: Promise.resolve({ id: 'meeting-1' })
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error[0].message).toBe('Meeting not found');
  });

  it('returns 200 when meeting is already ready (no-op)', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      status: 'ready',
      title: 'Done Meeting',
      transcriptOutput: { transcriptionText: 'text' }
    });

    const { POST } = await import('@/app/api/meetings/[id]/process/route');
    const response = await POST(_createRequest(), {
      params: Promise.resolve({ id: 'meeting-1' })
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.meeting.id).toBe('meeting-1');
    expect(mockWaitUntil).not.toHaveBeenCalled();
  });

  it('returns 202 with info when already processing without error', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      status: 'processing',
      errorMessage: null,
      transcriptOutput: { transcriptionText: 'text' }
    });

    const { POST } = await import('@/app/api/meetings/[id]/process/route');
    const response = await POST(_createRequest(), {
      params: Promise.resolve({ id: 'meeting-1' })
    });

    expect(response.status).toBe(202);
    const body = await response.json();
    expect(body.message).toBe('Meeting is already being processed');
    expect(mockWaitUntil).not.toHaveBeenCalled();
  });

  it('returns 422 when transcriptOutput is missing', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      status: 'processing',
      errorMessage: null,
      transcriptOutput: null
    });

    const { POST } = await import('@/app/api/meetings/[id]/process/route');
    const response = await POST(_createRequest(), {
      params: Promise.resolve({ id: 'meeting-1' })
    });

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error[0].message).toBe('Meeting has no transcript to process');
  });

  it('returns 422 when transcriptionText is empty', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      status: 'processing',
      errorMessage: null,
      transcriptOutput: { transcriptionText: '' }
    });

    const { POST } = await import('@/app/api/meetings/[id]/process/route');
    const response = await POST(_createRequest(), {
      params: Promise.resolve({ id: 'meeting-1' })
    });

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error[0].message).toBe('Meeting has no transcript to process');
  });
});
