import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: mockCreate };
  }
}));

vi.mock('@/env', () => ({
  env: {
    AI_API_KEY: 'test-key',
    DATABASE_URL: 'postgresql://test',
    REPLICATE_API_KEY: 'test-replicate-key'
  }
}));

const mockGetMeetingById = vi.fn();
const mockUpdateMeeting = vi.fn();

vi.mock('@/packages/factory/meetings/services/meeting-service', () => ({
  getMeetingById: (...args: unknown[]) => mockGetMeetingById(...args),
  updateMeeting: (...args: unknown[]) => mockUpdateMeeting(...args)
}));

const mockTranscribeWithWhisper = vi.fn();

vi.mock(
  '@/packages/factory/meetings/services/meeting-transcription-service',
  () => ({
    transcribeWithWhisper: (...args: unknown[]) =>
      mockTranscribeWithWhisper(...args)
  })
);

describe('meeting-ai-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateMeeting.mockResolvedValue({ id: 'meeting-1' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('extracts title, summary, and actionItems on success', async () => {
    const aiResponse = {
      title: 'Sprint Planning Review',
      summary: 'Team discussed sprint goals and assigned tasks.',
      actionItems: [{ text: 'Review PR #42' }, { text: 'Update docs' }]
    };

    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      transcriptOutput: {
        transcriptionText: 'Hello team, let us discuss sprint goals...',
        segments: [],
        durationSeconds: 300,
        detectedLanguage: 'en'
      },
      status: 'processing'
    });

    mockCreate
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(aiResponse) }]
      })
      .mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify({ pass: true, reason: 'Valid meeting data' })
          }
        ]
      });

    const { processMeetingTranscript } = await import(
      '../services/meeting-ai-service'
    );
    await processMeetingTranscript('meeting-1');

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockCreate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048
      })
    );

    expect(mockUpdateMeeting).toHaveBeenCalledWith('meeting-1', {
      title: 'Sprint Planning Review',
      summary: 'Team discussed sprint goals and assigned tasks.',
      actionItems: [{ text: 'Review PR #42' }, { text: 'Update docs' }],
      status: 'ready'
    });
  });

  it('sets status to failed when quality check fails', async () => {
    const aiResponse = {
      title: 'No Meeting Content Detected',
      summary: 'The transcript does not contain meeting content.',
      actionItems: []
    };

    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      transcriptOutput: {
        transcriptionText: 'random sentences not a meeting',
        segments: [],
        durationSeconds: 60,
        detectedLanguage: 'en'
      },
      status: 'processing'
    });

    mockCreate
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(aiResponse) }]
      })
      .mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              pass: false,
              reason: 'Output indicates content is not a real meeting'
            })
          }
        ]
      });

    const { processMeetingTranscript } = await import(
      '../services/meeting-ai-service'
    );
    await processMeetingTranscript('meeting-1');

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockUpdateMeeting).toHaveBeenCalledWith('meeting-1', {
      status: 'failed',
      errorMessage:
        'Quality check failed: Output indicates content is not a real meeting'
    });
  });

  it('sets status to failed when Anthropic API throws', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      transcriptOutput: {
        transcriptionText: 'Some transcript text',
        segments: [],
        durationSeconds: 120,
        detectedLanguage: 'en'
      },
      status: 'processing'
    });

    mockCreate.mockRejectedValue(new Error('API key invalid'));

    const { processMeetingTranscript } = await import(
      '../services/meeting-ai-service'
    );
    await processMeetingTranscript('meeting-1');

    expect(mockUpdateMeeting).toHaveBeenCalledWith('meeting-1', {
      status: 'failed',
      errorMessage: 'API key invalid'
    });
  });

  it('sets status to failed when AI returns invalid JSON', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      transcriptOutput: {
        transcriptionText: 'Some text',
        segments: [],
        durationSeconds: 60,
        detectedLanguage: 'en'
      },
      status: 'processing'
    });

    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not valid json at all' }]
    });

    const { processMeetingTranscript } = await import(
      '../services/meeting-ai-service'
    );
    await processMeetingTranscript('meeting-1');

    expect(mockUpdateMeeting).toHaveBeenCalledWith('meeting-1', {
      status: 'failed',
      errorMessage: expect.stringContaining('Failed to parse AI response')
    });
  });

  it('sets status to failed when AI response missing required fields', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      transcriptOutput: {
        transcriptionText: 'Some text',
        segments: [],
        durationSeconds: 60,
        detectedLanguage: 'en'
      },
      status: 'processing'
    });

    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({ title: 'Only title' }) }]
    });

    const { processMeetingTranscript } = await import(
      '../services/meeting-ai-service'
    );
    await processMeetingTranscript('meeting-1');

    expect(mockUpdateMeeting).toHaveBeenCalledWith('meeting-1', {
      status: 'failed',
      errorMessage: expect.stringContaining('Invalid AI response')
    });
  });

  it('returns early when meeting not found', async () => {
    mockGetMeetingById.mockResolvedValue(null);

    const { processMeetingTranscript } = await import(
      '../services/meeting-ai-service'
    );
    await processMeetingTranscript('nonexistent');

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdateMeeting).not.toHaveBeenCalled();
  });

  it('sets status to failed when transcriptionText is empty', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      transcriptOutput: {
        transcriptionText: '',
        segments: [],
        durationSeconds: 0,
        detectedLanguage: 'en'
      },
      status: 'processing'
    });

    const { processMeetingTranscript } = await import(
      '../services/meeting-ai-service'
    );
    await processMeetingTranscript('meeting-1');

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdateMeeting).toHaveBeenCalledWith('meeting-1', {
      status: 'failed',
      errorMessage: 'Transcript text is empty'
    });
  });

  it('sets status to failed when transcriptOutput is null', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      transcriptOutput: null,
      status: 'processing'
    });

    const { processMeetingTranscript } = await import(
      '../services/meeting-ai-service'
    );
    await processMeetingTranscript('meeting-1');

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdateMeeting).toHaveBeenCalledWith('meeting-1', {
      status: 'failed',
      errorMessage: 'Transcript text is empty'
    });
  });

  it('runs Whisper when no transcriptOutput and fileBuffer provided', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      transcriptOutput: null,
      status: 'processing'
    });

    mockTranscribeWithWhisper.mockResolvedValue({
      segments: [],
      transcriptionText: 'Whisper result text',
      durationSeconds: 60,
      detectedLanguage: 'english'
    });

    mockCreate
      .mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              title: 'Test',
              summary: 'Summary',
              actionItems: []
            })
          }
        ]
      })
      .mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify({ pass: true, reason: 'Valid' })
          }
        ]
      });

    const { processMeetingTranscript } = await import(
      '../services/meeting-ai-service'
    );
    await processMeetingTranscript(
      'meeting-1',
      Buffer.from('audio'),
      'test.mp4'
    );

    expect(mockTranscribeWithWhisper).toHaveBeenCalledWith(
      Buffer.from('audio'),
      'test.mp4'
    );
    expect(mockUpdateMeeting).toHaveBeenCalledWith('meeting-1', {
      transcriptOutput: expect.objectContaining({
        transcriptionText: 'Whisper result text'
      })
    });
  });

  it('sets failed status when Whisper fails and skips Haiku', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      transcriptOutput: null,
      status: 'processing'
    });

    mockTranscribeWithWhisper.mockRejectedValue(
      new Error('Replicate API error')
    );

    const { processMeetingTranscript } = await import(
      '../services/meeting-ai-service'
    );
    await processMeetingTranscript(
      'meeting-1',
      Buffer.from('audio'),
      'test.mp4'
    );

    expect(mockUpdateMeeting).toHaveBeenCalledWith('meeting-1', {
      status: 'failed',
      errorMessage: 'Replicate API error'
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('skips Whisper when transcriptOutput already exists', async () => {
    mockGetMeetingById.mockResolvedValue({
      id: 'meeting-1',
      transcriptOutput: {
        transcriptionText: 'Already transcribed',
        segments: [],
        durationSeconds: 30,
        detectedLanguage: 'english'
      },
      status: 'processing'
    });

    mockCreate
      .mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              title: 'Test',
              summary: 'Summary',
              actionItems: []
            })
          }
        ]
      })
      .mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify({ pass: true, reason: 'Valid' })
          }
        ]
      });

    const { processMeetingTranscript } = await import(
      '../services/meeting-ai-service'
    );
    await processMeetingTranscript(
      'meeting-1',
      Buffer.from('audio'),
      'test.mp4'
    );

    expect(mockTranscribeWithWhisper).not.toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });
});
