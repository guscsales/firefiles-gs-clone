import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/env', () => ({
  env: { DATABASE_URL: 'postgres://test' }
}));

vi.mock('@/packages/factory/meetings/services/meeting-service', () => ({
  createMeeting: vi.fn().mockResolvedValue({
    id: 'test-uuid',
    title: 'Untitled Meeting',
    status: 'processing',
    transcriptOutput: {},
    createdAt: new Date().toISOString()
  }),
  getMeetingById: vi.fn().mockResolvedValue(null),
  listMeetings: vi.fn().mockResolvedValue({
    data: [
      {
        id: 'test-uuid-1',
        title: 'Meeting 1',
        status: 'processing',
        createdAt: new Date().toISOString()
      }
    ],
    pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 }
  })
}));

vi.mock('@/packages/factory/meetings/services/meeting-ai-service', () => ({
  processMeetingTranscript: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@vercel/functions', () => ({
  waitUntil: vi.fn()
}));

vi.mock('@/packages/factory/meetings/mocks/get-mock-transcription', () => ({
  getMockTranscription: vi.fn().mockReturnValue({
    segments: [],
    transcriptionText: 'test text',
    durationSeconds: 10,
    detectedLanguage: 'english'
  })
}));

vi.mock('@/packages/plugins/logger/logger', () => ({
  createLoggerClient: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })
}));

import { GET, POST } from '@/app/api/meetings/route';

describe('POST /api/meetings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when no file is provided', async () => {
    const formData = new FormData();
    const request = new Request('http://localhost/api/meetings', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeInstanceOf(Array);
    expect(body.error[0]).toHaveProperty('path');
    expect(body.error[0]).toHaveProperty('message');
    expect(body.error[0].message).toBe('File is required');
  });

  it('returns 400 for invalid file extension', async () => {
    const file = new File(['content'], 'doc.pdf', {
      type: 'application/pdf'
    });
    const formData = new FormData();
    formData.append('file', file);

    const request = new Request('http://localhost/api/meetings', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error[0].path).toEqual(['file']);
    expect(body.error[0].message).toContain('Invalid file type');
  });

  it('returns 400 for invalid MIME type', async () => {
    const file = new File(['content'], 'audio.mp3', {
      type: 'text/plain'
    });
    const formData = new FormData();
    formData.append('file', file);

    const request = new Request('http://localhost/api/meetings', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error[0].message).toContain('Invalid MIME type');
  });

  it('returns 400 for file exceeding size limit', async () => {
    const largeContent = new ArrayBuffer(26 * 1024 * 1024);
    const file = new File([largeContent], 'big.mp3', {
      type: 'audio/mpeg'
    });
    const formData = new FormData();
    formData.append('file', file);

    const request = new Request('http://localhost/api/meetings', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error[0].message).toContain('File too large');
  });

  it('returns 201 with meeting on valid file upload', async () => {
    const file = new File(['audio content'], 'meeting.mp3', {
      type: 'audio/mpeg'
    });
    const formData = new FormData();
    formData.append('file', file);

    const request = new Request('http://localhost/api/meetings', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.meeting).toHaveProperty('id');
    expect(body.meeting).toHaveProperty('status', 'processing');
  });
});

describe('GET /api/meetings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated meetings list', async () => {
    const url = new URL(
      'http://localhost/api/meetings?page=1&sortBy=createdAt&sortOrder=desc'
    );
    const request = { nextUrl: url } as never;
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('pagination');
    expect(body.data).toBeInstanceOf(Array);
    expect(body.pagination).toHaveProperty('page');
    expect(body.pagination).toHaveProperty('total');
  });
});
