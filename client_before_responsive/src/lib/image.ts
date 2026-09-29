/**
 * Proxy semua image dari alqanime.net melalui backend
 * supaya browser tidak langsung kontak alqanime.net (SSL cert issue / internet positif)
 */
export function proxyImg(url?: string): string {
  if (!url) return '/img/no-image.svg';
  if (url.startsWith('/')) return url;
  return `/api/img?url=${encodeURIComponent(url)}`;
}
