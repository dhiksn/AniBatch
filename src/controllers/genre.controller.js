const { getGenres, getAnimeByGenre } = require('../services/scraper');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/genre
async function listGenres(req, res) {
  try {
    const data = await getGenres();
    return sendSuccess(res, data);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Terjadi kesalahan pada server'
        : err.message;
    return sendError(res, statusCode, code, message);
  }
}

// GET /api/genre/:slug
async function animeByGenre(req, res) {
  const { slug } = req.params;

  // Validate slug
  if (!slug || !/^[\w-]+$/.test(slug)) {
    return sendError(res, 400, 'BAD_REQUEST', 'Slug genre tidak valid');
  }

  const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);

  try {
    const { genre, animes, pagination } = await getAnimeByGenre(slug, pageNum);

    return sendSuccess(res, animes, 200, {
      genre,
      pagination: {
        page: pagination.page,
        hasPrev: pagination.hasPrev,
        hasNext: pagination.hasNext,
        totalPages: pagination.totalPages,
      },
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Terjadi kesalahan pada server'
        : err.message;
    return sendError(res, statusCode, code, message);
  }
}

module.exports = { listGenres, animeByGenre };
