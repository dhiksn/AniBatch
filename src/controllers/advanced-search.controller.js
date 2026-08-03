const { advancedSearch } = require('../services/scraper');
const { sendSuccess, sendError } = require('../utils/response');

// Allowed enum values (from form inspection)
const VALID_STATUS = new Set(['', 'ongoing', 'upcoming', 'completed']);
const VALID_ORDER  = new Set(['', 'title', 'titlereverse', 'update', 'added', 'popular', 'rating']);
const VALID_TYPE   = new Set(['bd', 'tv', 'movie', 'ova', 'ona', 'special', 'series', 'donghua', 'live-action']);

/**
 * GET /api/advanced-search
 *
 * Query params:
 *   title    {string}          — partial title match
 *   genre    {string|string[]} — one or more genre slugs
 *   season   {string|string[]} — one or more season slugs (e.g. "summer-2026")
 *   studio   {string|string[]} — one or more studio slugs
 *   status   {string}          — ongoing | upcoming | completed | "" (all)
 *   type     {string|string[]} — bd | tv | movie | ova | ona | special | series | donghua | live-action
 *   order    {string}          — title | titlereverse | update | added | popular | rating | "" (default)
 *   page     {number}          — pagination, default 1
 */
async function advancedSearchHandler(req, res) {
  const { title, status, order, page } = req.query;

  // Normalise array params — Express parses ?genre=action&genre=fantasy as array,
  // but ?genre[]=action&genre[]=fantasy too; handle both forms.
  const toArray = (val) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const genres  = toArray(req.query['genre']  ?? req.query['genre[]']);
  const seasons = toArray(req.query['season'] ?? req.query['season[]']);
  const studios = toArray(req.query['studio'] ?? req.query['studio[]']);
  const types   = toArray(req.query['type']   ?? req.query['type[]']);

  // --- Validation ---

  if (status !== undefined && !VALID_STATUS.has(status)) {
    return sendError(res, 400, 'BAD_REQUEST',
      `Parameter "status" tidak valid. Nilai yang diizinkan: ongoing, upcoming, completed`);
  }

  if (order !== undefined && !VALID_ORDER.has(order)) {
    return sendError(res, 400, 'BAD_REQUEST',
      `Parameter "order" tidak valid. Nilai yang diizinkan: title, titlereverse, update, added, popular, rating`);
  }

  for (const t of types) {
    if (!VALID_TYPE.has(t.toLowerCase())) {
      return sendError(res, 400, 'BAD_REQUEST',
        `Nilai type "${t}" tidak valid. Nilai yang diizinkan: ${[...VALID_TYPE].join(', ')}`);
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  try {
    const { results, pagination } = await advancedSearch({
      title:   title  ? title.trim()      : '',
      genres,
      seasons,
      studios,
      types:   types.map(t => t.toLowerCase()),
      status:  status  || '',
      order:   order   || '',
      page:    pageNum,
    });

    return sendSuccess(res, results, 200, {
      filters: { title: title || '', genres, seasons, studios, types, status: status || '', order: order || '' },
      pagination: {
        page:       pagination.page,
        hasPrev:    pagination.hasPrev,
        hasNext:    pagination.hasNext,
        totalPages: pagination.totalPages,
      },
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const message = process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server'
      : err.message;
    return sendError(res, statusCode, code, message);
  }
}

module.exports = { advancedSearchHandler };
