const { getSeasonList } = require('../services/scraper');
const { sendSuccess, sendError } = require('../utils/response');

async function seasons(req, res) {
  try {
    const data = await getSeasonList();
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

module.exports = { seasons };
