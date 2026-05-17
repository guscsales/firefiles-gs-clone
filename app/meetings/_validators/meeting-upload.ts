import { z } from 'zod';

export const ALLOWED_EXTENSIONS = [
  '.mp3',
  '.mp4',
  '.mpeg',
  '.mpga',
  '.m4a',
  '.wav',
  '.webm'
];

export const ALLOWED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/webm',
  'audio/x-m4a',
  'video/mp4',
  'video/mpeg',
  'video/webm'
];

export const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB

export const ACCEPT_STRING = ALLOWED_MIME_TYPES.join(',');

function _getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot).toLowerCase();
}

export const meetingUploadSchema = z.object({
  file: z
    .instanceof(File, { message: 'File is required' })
    .refine(
      (file) => ALLOWED_EXTENSIONS.includes(_getFileExtension(file.name)),
      `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
    )
    .refine(
      (file) => ALLOWED_MIME_TYPES.includes(file.type),
      `Invalid MIME type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
    )
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
});
