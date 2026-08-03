const { getAnimeByCast } = require('../services/scraper');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/cast/:slug
// GET /api/cast/:slug?page=2
async function cast(req, res) {
  const { slug } = req.params;

  if (!slug || !/^[\w-]+$/.test(slug)) {
    return sendError(res, 400, 'BAD_REQUEST', 'Slug cast tidak valid');
  }

  const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);

  try {
    const { name, animes, pagination } = await getAnimeByCast(slug, pageNum);

    return sendSuccess(res, animes, 200, {
      cast: { name, slug },
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

module.exports = { cast };
