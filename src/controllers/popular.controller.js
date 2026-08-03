const { getPopular } = require('../services/scraper');
const { sendSuccess, sendError } = require('../utils/response');

async function popular(req, res) {
  const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);

  try {
    const { animes, pagination } = await getPopular(pageNum);

    return sendSuccess(res, animes, 200, {
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

module.exports = { popular };
