import https from 'https';
import zlib from 'zlib';

const BASE_URL        = process.env.BASE_URL || 'https://alqanime.net';
const TIMEOUT_MS      = parseInt(process.env.HTTP_TIMEOUT, 10) || 12000;
const MAX_REDIRECTS   = parseInt(process.env.HTTP_MAX_REDIRECTS, 10) || 5;
const REQUEST_RETRIES = 3;
const RETRY_DELAY_MS  = 2000;

const BASE_HOST = new URL(BASE_URL).hostname;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function _rawGet(path, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_HOST,
      port: 443,
      path,
      method: 'GET',
      rejectUnauthorized: false,
      timeout: TIMEOUT_MS,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
      },
    };

    const req = https.request(options, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        if (redirectCount >= MAX_REDIRECTS) return reject(new Error('Too many redirects'));
        const location = res.headers.location;
        let nextPath;
        try {
          const u = new URL(location, BASE_URL);
          if (u.hostname !== BASE_HOST) {
            const e = new Error(`Cross-host redirect to ${u.hostname}`);
            e.statusCode = 503; e.code = 'SERVICE_UNAVAILABLE';
            return reject(e);
          }
          nextPath = u.pathname + u.search;
        } catch { nextPath = location; }
        res.resume();
        return resolve(_rawGet(nextPath, redirectCount + 1));
      }

      if (res.statusCode === 404) {
        res.resume();
        const e = new Error('Halaman tidak ditemukan di website target');
        e.statusCode = 404; e.code = 'NOT_FOUND'; return reject(e);
      }
      if (res.statusCode === 429) {
        res.resume();
        const e = new Error('Target website membatasi request. Coba lagi nanti.');
        e.statusCode = 429; e.code = 'TOO_MANY_REQUESTS'; return reject(e);
      }
      if (res.statusCode >= 400) {
        res.resume();
        const e = new Error(`Target website merespons dengan status ${res.statusCode}`);
        e.statusCode = 502; e.code = 'BAD_GATEWAY'; return reject(e);
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        let body = Buffer.concat(chunks);
        const enc = res.headers['content-encoding'];
        try {
          if (enc === 'gzip') body = zlib.gunzipSync(body);
          else if (enc === 'deflate') body = zlib.inflateSync(body);
          else if (enc === 'br') body = zlib.brotliDecompressSync(body);
        } catch (_) {}
        resolve(body.toString('utf-8'));
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const e = new Error('Request timed out');
      e.statusCode = 408; e.code = 'TIMEOUT'; reject(e);
    });
    req.on('error', (err) => {
      const e = new Error(`Network error: ${err.message}`);
      e.statusCode = 503; e.code = err.code || 'SERVICE_UNAVAILABLE'; reject(e);
    });
    req.end();
  });
}

export async function fetchPage(path) {
  const TRANSIENT = new Set(['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'TIMEOUT']);
  for (let attempt = 1; attempt <= REQUEST_RETRIES; attempt++) {
    try {
      return await _rawGet(path);
    } catch (err) {
      const isTransient = TRANSIENT.has(err.code);
      const isLast = attempt === REQUEST_RETRIES;
      if (isLast || !isTransient) {
        if (!err.statusCode) { err.statusCode = 503; err.code = 'SERVICE_UNAVAILABLE'; }
        throw err;
      }
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
}

export { BASE_URL };
