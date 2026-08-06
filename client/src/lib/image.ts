/**
 * Proxy semua image dari alqanime.net melalui backend
 * supaya browser tidak langsung kontak alqanime.net (SSL cert issue / internet positif)
 */
export function proxyImg(url?: string): string {
  if (!url) return '/img/no-image.svg';
  // Sudah proxy atau bukan dari alqanime — return as-is
  if (url.startsWith('/') || !url.includes('alqanime.net')) return url;
  return `/img-proxy?url=${encodeURIComponent(url)}`;
}
