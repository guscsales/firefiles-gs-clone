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
