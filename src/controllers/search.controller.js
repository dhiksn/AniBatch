const { searchAnime } = require('../services/scraper');
const { sendSuccess, sendError } = require('../utils/response');

async function search(req, res) {
  const { q, page } = req.query;

  // Validate query parameter
  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return sendError(
      res,
      400,
      'BAD_REQUEST',
      'Parameter "q" wajib diisi dan minimal 2 karakter'
    );
  }

  // Sanitise and parse page number
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  try {
    const { results, pagination } = await searchAnime(q.trim(), pageNum);

    return sendSuccess(res, results, 200, {
      query: q.trim(),
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

module.exports = { search };
