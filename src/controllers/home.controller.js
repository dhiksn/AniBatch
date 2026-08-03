const { getHome } = require('../services/scraper');
const { sendSuccess, sendError } = require('../utils/response');

async function home(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  try {
    const data = await getHome(page);
    return sendSuccess(res, data, 200, {
      pagination: data.pagination || null,
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

module.exports = { home };
