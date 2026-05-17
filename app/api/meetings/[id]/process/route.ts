import { waitUntil } from '@vercel/functions';
import { NextResponse } from 'next/server';
import { processMeetingTranscript } from '@/packages/factory/meetings/services/meeting-ai-service';
import { getMeetingById } from '@/packages/factory/meetings/services/meeting-service';
import { createLoggerClient } from '@/packages/plugins/logger/logger';

const logger = createLoggerClient('api:meetings:process');

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const meeting = await getMeetingById(id);

    if (!meeting) {
      return NextResponse.json(
        { error: [{ path: ['id'], message: 'Meeting not found' }] },
        { status: 404 }
      );
    }

    if (meeting.status === 'ready') {
      return NextResponse.json({ meeting }, { status: 200 });
    }

    const transcriptOutput = meeting.transcriptOutput as {
      transcriptionText?: string;
    } | null;
    const transcriptionText = transcriptOutput?.transcriptionText;

    if (!transcriptionText) {
      return NextResponse.json(
        {
          error: [
            {
              path: ['transcriptOutput'],
              message: 'Meeting has no transcript to process'
            }
          ]
        },
        { status: 422 }
      );
    }

    if (meeting.status === 'processing' && !meeting.errorMessage) {
      return NextResponse.json(
        { meeting, message: 'Meeting is already being processed' },
        { status: 202 }
      );
    }

    waitUntil(processMeetingTranscript(id));

    return NextResponse.json({ meeting }, { status: 202 });
  } catch (error) {
    logger.error('Failed to process meeting', error);
    return NextResponse.json(
      { error: [{ path: ['server'], message: 'Internal server error' }] },
      { status: 500 }
    );
  }
}
