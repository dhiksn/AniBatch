/**
 * Proxy semua image dari alqanime.net melalui Next.js API route /api/img
 */
export function proxyImg(url?: string): string {
  if (!url) return '/img/no-image.svg';
  if (url.startsWith('/')) return url;
  return `/api/img?url=${encodeURIComponent(url)}`;
}
