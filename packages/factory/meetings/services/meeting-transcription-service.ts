import Replicate from 'replicate';
import { env } from '@/env';
import type { TranscriptionOutput } from '../models/transcription-output';

const WHISPER_MODEL =
  'openai/whisper:8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e';

type WhisperSegment = {
  id: number;
  start: number;
  end: number;
  seek: number;
  text: string;
  tokens: number[];
  avg_logprob: number;
  temperature: number;
  no_speech_prob: number;
  compression_ratio: number;
};

type WhisperOutput = {
  segments: WhisperSegment[];
  transcription: string;
  detected_language: string;
  translation: string | null;
};

function _getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    wav: 'audio/wav',
    webm: 'audio/webm',
    m4a: 'audio/mp4',
    mpeg: 'video/mpeg',
    mpga: 'audio/mpeg'
  };
  return mimeMap[ext ?? ''] ?? 'application/octet-stream';
}

export async function transcribeWithWhisper(
  fileBuffer: Buffer,
  fileName: string
): Promise<TranscriptionOutput> {
  const replicate = new Replicate({ auth: env.REPLICATE_API_KEY });

  const mimeType = _getMimeType(fileName);
  const base64 = fileBuffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64}`;

  const output = (await replicate.run(WHISPER_MODEL, {
    input: {
      audio: dataUri,
      language: 'auto',
      translate: false,
      temperature: 0,
      transcription: 'plain text',
      suppress_tokens: '-1',
      logprob_threshold: -1,
      no_speech_threshold: 0.6,
      condition_on_previous_text: true,
      compression_ratio_threshold: 2.4,
      temperature_increment_on_fallback: 0.2
    }
  })) as WhisperOutput;

  if (!output.transcription || output.transcription.trim() === '') {
    throw new Error('Whisper returned empty transcription');
  }

  const lastSegment = output.segments[output.segments.length - 1];

  return {
    segments: output.segments.map((seg) => ({
      id: seg.id,
      start: seg.start,
      end: seg.end,
      seek: seg.seek,
      text: seg.text,
      tokens: seg.tokens,
      avg_logprob: seg.avg_logprob,
      temperature: seg.temperature,
      no_speech_prob: seg.no_speech_prob,
      compression_ratio: seg.compression_ratio
    })),
    transcriptionText: output.transcription,
    durationSeconds: lastSegment?.end ?? 0,
    detectedLanguage: output.detected_language
  };
}
