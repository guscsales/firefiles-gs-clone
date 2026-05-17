'use client';

function _formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

type TranscriptSegment = {
  id: number;
  start: number;
  end: number;
  text: string;
};

export function MeetingTranscriptionTab({
  transcriptOutput
}: {
  transcriptOutput: {
    segments: TranscriptSegment[];
  } | null;
}) {
  if (!transcriptOutput || transcriptOutput.segments.length === 0) {
    return (
      <p className="font-sans text-sm text-muted-foreground py-4">
        No transcription available
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 py-4">
      {transcriptOutput.segments.map((segment) => (
        <div
          key={segment.id}
          className="flex items-start gap-4 py-2 rounded-md hover:bg-muted/50 px-2 -mx-2 transition-colors"
        >
          <span className="font-mono text-xs text-muted-foreground mt-0.5 shrink-0 w-10">
            {_formatTimestamp(segment.start)}
          </span>
          <p className="font-sans text-sm leading-6 text-foreground">
            {segment.text}
          </p>
        </div>
      ))}
    </div>
  );
}
