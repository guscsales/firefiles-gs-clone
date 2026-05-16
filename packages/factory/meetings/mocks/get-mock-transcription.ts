import type { TranscriptionOutput } from '../models/transcription-output';
import mockResponse from './output-transcription.json';

export function getMockTranscription(): TranscriptionOutput {
  const output = mockResponse.output;
  const segments = output.segments;
  const lastSegment = segments[segments.length - 1];

  return {
    segments,
    transcriptionText: output.transcription,
    durationSeconds: lastSegment?.end ?? 0,
    detectedLanguage: output.detected_language
  };
}
