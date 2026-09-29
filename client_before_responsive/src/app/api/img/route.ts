import https from 'https';
import http from 'http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url || !url.startsWith('http'))
    return Response.json({ error: 'URL tidak valid' }, { status: 400 });

  return new Promise<Response>((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    (lib as typeof https).get(url as any, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://alqanime.net/',
      },
      rejectUnauthorized: false,
    } as any, (imgRes: any) => {
      const chunks: Buffer[] = [];
      imgRes.on('data', (c: Buffer) => chunks.push(c));
      imgRes.on('end', () => {
        resolve(new Response(Buffer.concat(chunks), {
          status: 200,
          headers: {
            'Content-Type': imgRes.headers['content-type'] || 'image/jpeg',
            'Cache-Control': 'public, max-age=86400',
          },
        }));
      });
    }).on('error', () => resolve(new Response(null, { status: 502 })));
  });
}
