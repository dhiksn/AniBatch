import { getSeasonList } from '@/lib/scraper/index.js';
import { successResponse, handleError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return successResponse(await getSeasonList());
  } catch (err) {
    return handleError(err);
  }
}
