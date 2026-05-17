import { describe, expect, it } from 'vitest';
import {
  ACCEPT_STRING,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
} from '../_validators/meeting-upload';

describe('meeting-upload validators', () => {
  it('defines allowed audio/video extensions', () => {
    expect(ALLOWED_EXTENSIONS).toContain('.mp3');
    expect(ALLOWED_EXTENSIONS).toContain('.mp4');
    expect(ALLOWED_EXTENSIONS).toContain('.wav');
    expect(ALLOWED_EXTENSIONS).toContain('.webm');
    expect(ALLOWED_EXTENSIONS).toContain('.m4a');
    expect(ALLOWED_EXTENSIONS).not.toContain('.pdf');
    expect(ALLOWED_EXTENSIONS).not.toContain('.txt');
  });

  it('defines allowed MIME types', () => {
    expect(ALLOWED_MIME_TYPES).toContain('audio/mpeg');
    expect(ALLOWED_MIME_TYPES).toContain('video/mp4');
    expect(ALLOWED_MIME_TYPES).toContain('audio/wav');
    expect(ALLOWED_MIME_TYPES).not.toContain('application/pdf');
  });

  it('sets max file size to 25MB', () => {
    expect(MAX_FILE_SIZE).toBe(25 * 1024 * 1024);
  });

  it('generates accept string from MIME types', () => {
    const types = ACCEPT_STRING.split(',');
    expect(types.length).toBe(ALLOWED_MIME_TYPES.length);

    for (const mime of ALLOWED_MIME_TYPES) {
      expect(ACCEPT_STRING).toContain(mime);
    }
  });
});
