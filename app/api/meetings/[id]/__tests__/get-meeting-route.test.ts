import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetMeetingById = vi.fn();

vi.mock('@/packages/factory/meetings/services/meeting-service', () => ({
  getMeetingById: (...args: unknown[]) => mockGetMeetingById(...args)
}));

vi.mock('@/env', () => ({
  env: { DATABASE_URL: 'postgres://test', AI_API_KEY: 'test-key' }
}));

describe('GET /api/meetings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with meeting when found', async () => {
    const meeting = {
      id: 'meeting-1',
      title: 'Sprint Planning',
      status: 'ready',
      summary: 'Discussed goals',
      actionItems: [{ text: 'Review PR' }],
      transcriptOutput: { transcriptionText: 'hello', segments: [] }
    };
    mockGetMeetingById.mockResolvedValue(meeting);

    const { GET } = await import('@/app/api/meetings/[id]/route');
    const response = await GET(
      new Request('http://localhost/api/meetings/meeting-1'),
      { params: Promise.resolve({ id: 'meeting-1' }) }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.meeting.id).toBe('meeting-1');
    expect(body.meeting.title).toBe('Sprint Planning');
  });

  it('returns 404 when meeting not found', async () => {
    mockGetMeetingById.mockResolvedValue(null);

    const { GET } = await import('@/app/api/meetings/[id]/route');
    const response = await GET(
      new Request('http://localhost/api/meetings/nonexistent'),
      { params: Promise.resolve({ id: 'nonexistent' }) }
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error[0].message).toBe('Meeting not found');
  });
});
