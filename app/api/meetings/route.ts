import { waitUntil } from '@vercel/functions';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { meetingUploadSchema } from '@/app/meetings/_validators/meeting-upload';
import { processMeetingTranscript } from '@/packages/factory/meetings/services/meeting-ai-service';
import {
  createMeeting,
  listMeetings
} from '@/packages/factory/meetings/services/meeting-service';
import { createLoggerClient } from '@/packages/plugins/logger/logger';

const logger = createLoggerClient('api:meetings');

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

  const parsed = meetingUploadSchema.safeParse({
    file: formData.get('file')
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { file } = parsed.data;

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const meeting = await createMeeting({ status: 'processing' });

    logger.info(`Meeting created - ID: ${meeting.id}`);

    waitUntil(processMeetingTranscript(meeting.id, fileBuffer, file.name));

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create meeting', error);
    return NextResponse.json(
      { error: [{ path: ['server'], message: 'Internal server error' }] },
      { status: 500 }
    );
  }
}
