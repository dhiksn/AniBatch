const { getPopularSidebar } = require('../services/scraper');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/popular-sidebar
async function popularSidebar(req, res) {
  try {
    const data = await getPopularSidebar();
    return sendSuccess(res, data);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const message = process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server'
      : err.message;
    return sendError(res, statusCode, code, message);
  }
}

module.exports = { popularSidebar };
