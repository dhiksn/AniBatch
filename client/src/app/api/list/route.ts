import { getAnimeList } from '@/lib/scraper/index.js';
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const letter = searchParams.get('letter');
  if (letter !== null && !/^[a-zA-Z0-9#]$/.test(letter))
    return errorResponse(400, 'BAD_REQUEST', 'Parameter "letter" harus berupa satu huruf (A-Z), angka (0-9), atau "#"');
  try {
    const fn = getAnimeList as (letter?: string | null) => Promise<unknown>;
    return successResponse(await fn(letter ? letter.toUpperCase() : null));
  } catch (err) {
    return handleError(err);
  }
}
