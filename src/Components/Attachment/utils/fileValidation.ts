export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/xml',
  'text/xml',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',
];

export function isAllowedFile(file: File): boolean {
  const isImage = file.type.startsWith('image/');
  const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.type);
  const ext = file.name.toLowerCase();

  const isSpecial =
    ext.endsWith('.excalidraw') ||
    ext.endsWith('.zip') ||
    ext.endsWith('.rar');

  return isImage || isAllowedMime || isSpecial;
}

export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}
