import { NextResponse } from 'next/server';
import { getMeetingById } from '@/packages/factory/meetings/services/meeting-service';
import { createLoggerClient } from '@/packages/plugins/logger/logger';

const logger = createLoggerClient('api:meetings:detail');

export async function GET(
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

    return NextResponse.json({ meeting });
  } catch (error) {
    logger.error('Failed to get meeting', error);
    return NextResponse.json(
      { error: [{ path: ['server'], message: 'Internal server error' }] },
      { status: 500 }
    );
  }
}
