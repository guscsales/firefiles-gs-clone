export type TranscriptionSegment = {
  id: number;
  start: number;
  end: number;
  text: string;
  seek: number;
  tokens: number[];
  avg_logprob: number;
  temperature: number;
  no_speech_prob: number;
  compression_ratio: number;
};

export type TranscriptionOutput = {
  segments: TranscriptionSegment[];
  transcriptionText: string;
  durationSeconds: number;
  detectedLanguage: string;
};
