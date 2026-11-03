const IMG_PROXY_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Proxy semua image dari alqanime.net melalui backend VPS
 * supaya browser tidak langsung kontak alqanime.net (SSL cert issue / internet positif)
 */
export function proxyImg(url?: string): string {
  if (!url) return '/img/no-image.svg';
  if (url.startsWith('/')) return url;
  return `${IMG_PROXY_BASE}/img?url=${encodeURIComponent(url)}`;
}
