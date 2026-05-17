import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRun = vi.fn();

vi.mock('replicate', () => ({
  default: class {
    constructor() {}
    run = mockRun;
  }
}));

vi.mock('@/env', () => ({
  env: {
    DATABASE_URL: 'postgres://test',
    AI_API_KEY: 'test-key',
    REPLICATE_API_KEY: 'test-replicate-key'
  }
}));

describe('meeting-transcription-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped TranscriptionOutput on success', async () => {
    mockRun.mockResolvedValue({
      segments: [
        {
          id: 0,
          start: 0,
          end: 12.5,
          seek: 0,
          text: ' Hello team, welcome to the meeting.',
          tokens: [50365],
          avg_logprob: -0.05,
          temperature: 0,
          no_speech_prob: 0.02,
          compression_ratio: 1.35
        }
      ],
      transcription: ' Hello team, welcome to the meeting.',
      detected_language: 'english',
      translation: null
    });

    const { transcribeWithWhisper } = await import(
      '../services/meeting-transcription-service'
    );

    const fileBuffer = Buffer.from('fake-audio-data');
    const result = await transcribeWithWhisper(fileBuffer, 'test.mp4');

    expect(result.transcriptionText).toBe(
      ' Hello team, welcome to the meeting.'
    );
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0].start).toBe(0);
    expect(result.segments[0].end).toBe(12.5);
    expect(result.durationSeconds).toBe(12.5);
    expect(result.detectedLanguage).toBe('english');
    expect(mockRun).toHaveBeenCalledOnce();
  });

  it('throws when Replicate API fails', async () => {
    mockRun.mockRejectedValue(new Error('Replicate API error'));

    const { transcribeWithWhisper } = await import(
      '../services/meeting-transcription-service'
    );

    const fileBuffer = Buffer.from('fake-audio-data');
    await expect(transcribeWithWhisper(fileBuffer, 'test.mp4')).rejects.toThrow(
      'Replicate API error'
    );
  });

  it('throws when output has no transcription', async () => {
    mockRun.mockResolvedValue({
      segments: [],
      transcription: '',
      detected_language: 'english'
    });

    const { transcribeWithWhisper } = await import(
      '../services/meeting-transcription-service'
    );

    const fileBuffer = Buffer.from('fake-audio-data');
    await expect(transcribeWithWhisper(fileBuffer, 'test.mp4')).rejects.toThrow(
      'Whisper returned empty transcription'
    );
  });
});
