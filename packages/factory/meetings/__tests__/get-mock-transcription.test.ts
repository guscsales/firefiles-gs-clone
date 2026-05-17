import { describe, expect, it } from 'vitest';
import { getMockTranscription } from '../mocks/get-mock-transcription';

describe('getMockTranscription', () => {
  it('returns transcription output with all required fields', () => {
    const result = getMockTranscription();

    expect(result).toHaveProperty('segments');
    expect(result).toHaveProperty('transcriptionText');
    expect(result).toHaveProperty('durationSeconds');
    expect(result).toHaveProperty('detectedLanguage');
  });

  it('returns non-empty segments array', () => {
    const result = getMockTranscription();

    expect(result.segments.length).toBeGreaterThan(0);
  });

  it('returns segments with required shape', () => {
    const result = getMockTranscription();
    const segment = result.segments[0];

    expect(segment).toHaveProperty('id');
    expect(segment).toHaveProperty('start');
    expect(segment).toHaveProperty('end');
    expect(segment).toHaveProperty('text');
    expect(typeof segment.id).toBe('number');
    expect(typeof segment.start).toBe('number');
    expect(typeof segment.end).toBe('number');
    expect(typeof segment.text).toBe('string');
  });

  it('returns non-empty transcription text', () => {
    const result = getMockTranscription();

    expect(result.transcriptionText.length).toBeGreaterThan(0);
  });

  it('computes duration from last segment end time', () => {
    const result = getMockTranscription();
    const lastSegment = result.segments[result.segments.length - 1];

    expect(result.durationSeconds).toBe(lastSegment.end);
  });

  it('returns detected language', () => {
    const result = getMockTranscription();

    expect(result.detectedLanguage).toBe('english');
  });
});
