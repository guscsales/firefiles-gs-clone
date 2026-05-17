import { waitUntil } from '@vercel/functions';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
} from '@/app/meetings/_validators/meeting-upload';
import { env } from '@/env';
import { getMockTranscription } from '@/packages/factory/meetings/mocks/get-mock-transcription';
import { processMeetingTranscript } from '@/packages/factory/meetings/services/meeting-ai-service';
import {
  createMeeting,
  listMeetings
} from '@/packages/factory/meetings/services/meeting-service';
import { createLoggerClient } from '@/packages/plugins/logger/logger';

const logger = createLoggerClient('api:meetings');

function _validationError(message: string) {
  return NextResponse.json(
    { error: [{ path: ['file'], message }] },
    { status: 400 }
  );
}

function _getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot).toLowerCase();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Number(searchParams.get('page') ?? 1);
    const pageSize = Number(searchParams.get('pageSize') ?? 10);
    const sortBy =
      (searchParams.get('sortBy') as 'title' | 'createdAt') ?? 'createdAt';
    const sortOrder =
      (searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc';
    const search = searchParams.get('search') ?? undefined;

    const result = await listMeetings({
      page,
      pageSize,
      sortBy,
      sortOrder,
      search
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to list meetings', error);
    return NextResponse.json(
      { error: [{ path: ['server'], message: 'Internal server error' }] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return _validationError('File is required');
  }

  const extension = _getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return _validationError(
      `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return _validationError(
      `Invalid MIME type "${file.type}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return _validationError(
      `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  try {
    const useWhisper = !!env.REPLICATE_API_KEY;

    if (useWhisper) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      const meeting = await createMeeting({ status: 'processing' });

      logger.info(`Meeting created - ID: ${meeting.id}`);

      waitUntil(processMeetingTranscript(meeting.id, fileBuffer, file.name));

      return NextResponse.json({ meeting }, { status: 201 });
    }

    const transcriptOutput = getMockTranscription();

    const meeting = await createMeeting({
      transcriptOutput,
      status: 'processing'
    });

    logger.info(`Meeting created - ID: ${meeting.id}`);

    waitUntil(processMeetingTranscript(meeting.id));

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create meeting', error);
    return NextResponse.json(
      { error: [{ path: ['server'], message: 'Internal server error' }] },
      { status: 500 }
    );
  }
}
