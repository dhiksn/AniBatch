const IMG_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

/**
 * Proxy semua image dari alqanime.net melalui backend
 */
export function proxyImg(url?: string): string {
  if (!url) return '/img/no-image.svg';
  if (url.startsWith('/')) return url;
  return `${IMG_BASE}/img?url=${encodeURIComponent(url)}`;
}
