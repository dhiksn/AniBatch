/**
 * test-proxy.js
 * 
 * Fetch free proxy list dari proxifly dan test mana yang bisa bypass
 * Cloudflare managed challenge di alqanime.net
 * 
 * Usage:
 *   node test-proxy.js
 *   node test-proxy.js --concurrency=5 --max=50
 */

const https = require('https');
const http  = require('http');
const net   = require('net');
const zlib  = require('zlib');

const TARGET_URL    = 'https://alqanime.net/';
const TARGET_HOST   = 'alqanime.net';
const PROXY_LIST_URL = 'https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/https/data.json';
const TIMEOUT_MS    = 15000;

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k,v] = a.slice(2).split('='); return [k, v || true]; })
);
const CONCURRENCY = parseInt(args.concurrency) || 3;
const MAX_PROXIES = parseInt(args.max) || 100;
const OUTPUT_FILE = args.out || 'working-proxies.txt';

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000 }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

/**
 * Test satu proxy HTTPS dengan CONNECT tunnel
 */
function testProxy(proxy) {
  return new Promise((resolve) => {
    const { ip, port } = proxy;
    const timer = setTimeout(() => {
      resolve({ ...proxy, ok: false, reason: 'timeout' });
    }, TIMEOUT_MS);

    // Open TCP connection to proxy
    const socket = net.createConnection({ host: ip, port, timeout: 8000 });

    socket.on('error', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ ...proxy, ok: false, reason: 'connect_error' });
    });

    socket.on('timeout', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ ...proxy, ok: false, reason: 'socket_timeout' });
    });

    socket.on('connect', () => {
      // Send CONNECT request
      socket.write(`CONNECT ${TARGET_HOST}:443 HTTP/1.1\r\nHost: ${TARGET_HOST}:443\r\n\r\n`);
    });

    let buffer = '';
    socket.on('data', (chunk) => {
      buffer += chunk.toString();

      // Check CONNECT response
      if (buffer.includes('\r\n\r\n')) {
        const statusLine = buffer.split('\r\n')[0];
        const statusCode = parseInt(statusLine.split(' ')[1]);

        if (statusCode !== 200) {
          clearTimeout(timer);
          socket.destroy();
          return resolve({ ...proxy, ok: false, reason: `connect_${statusCode}` });
        }

        // CONNECT succeeded — now do HTTPS handshake
        const tlsSocket = require('tls').connect({
          socket,
          servername: TARGET_HOST,
          rejectUnauthorized: false,
        });

        tlsSocket.on('error', () => {
          clearTimeout(timer);
          socket.destroy();
          resolve({ ...proxy, ok: false, reason: 'tls_error' });
        });

        tlsSocket.on('secureConnect', () => {
          // Send HTTP GET
          tlsSocket.write(
            `GET / HTTP/1.1\r\n` +
            `Host: ${TARGET_HOST}\r\n` +
            `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36\r\n` +
            `Accept: text/html\r\n` +
            `Connection: close\r\n\r\n`
          );

          let responseBuffer = Buffer.alloc(0);
          let headers = '';
          let headersDone = false;
          let statusCode2 = 0;

          tlsSocket.on('data', (d) => {
            responseBuffer = Buffer.concat([responseBuffer, d]);
            const str = responseBuffer.toString('utf8', 0, Math.min(responseBuffer.length, 2000));

            if (!headersDone && str.includes('\r\n\r\n')) {
              headers = str.split('\r\n\r\n')[0];
              const sl = headers.split('\r\n')[0];
              statusCode2 = parseInt(sl.split(' ')[1]);
              headersDone = true;
            }
          });

          tlsSocket.on('end', () => {
            clearTimeout(timer);

            // Decompress if needed
            let body = '';
            try {
              const enc = (headers.match(/content-encoding:\s*(\S+)/i) || [])[1];
              const bodyBuf = responseBuffer.slice(responseBuffer.indexOf('\r\n\r\n') + 4);
              if (enc === 'gzip')       body = zlib.gunzipSync(bodyBuf).toString('utf8');
              else if (enc === 'br')    body = zlib.brotliDecompressSync(bodyBuf).toString('utf8');
              else                      body = bodyBuf.toString('utf8');
            } catch (_) {
              body = responseBuffer.toString('utf8').slice(0, 3000);
            }

            const isCf = body.includes('Just a moment') ||
                         body.includes('Performing security verification') ||
                         body.includes('cf-browser-verification');

            const isBlocked = body.includes('Internet Baik') || statusCode2 === 403;

            if (isCf || isBlocked) {
              resolve({ ...proxy, ok: false, reason: isCf ? 'cf_challenge' : 'blocked' });
            } else if (statusCode2 >= 200 && statusCode2 < 400) {
              // Check if we got actual anime content
              const hasContent = body.includes('alqanime') || body.includes('anime') || body.includes('<!DOCTYPE');
              resolve({ ...proxy, ok: hasContent, reason: hasContent ? 'ok' : `status_${statusCode2}`, statusCode: statusCode2 });
            } else {
              resolve({ ...proxy, ok: false, reason: `status_${statusCode2}` });
            }
          });

          tlsSocket.on('error', () => {
            clearTimeout(timer);
            resolve({ ...proxy, ok: false, reason: 'tls_read_error' });
          });
        });
      }
    });
  });
}

async function runBatch(proxies, concurrency) {
  const results = [];
  const working = [];
  let idx = 0;
  let done = 0;

  async function worker() {
    while (idx < proxies.length) {
      const proxy = proxies[idx++];
      const result = await testProxy(proxy);
      done++;
      const pct = ((done / proxies.length) * 100).toFixed(0);
      const status = result.ok ? '✅' : '❌';
      process.stdout.write(`\r[${pct}%] ${done}/${proxies.length} | ${status} ${proxy.ip}:${proxy.port} (${result.reason})   `);
      if (result.ok) {
        working.push(result);
        console.log(`\n  🎉 WORKING PROXY: ${proxy.proxy}`);
      }
      results.push(result);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return { results, working };
}

async function main() {
  console.log('📋 Fetching proxy list dari proxifly...');

  let proxies;
  try {
    proxies = await fetch(PROXY_LIST_URL);
    console.log(`✅ ${proxies.length} HTTPS proxies ditemukan`);
  } catch (e) {
    console.error('❌ Gagal fetch proxy list:', e.message);
    process.exit(1);
  }

  // Filter dan shuffle
  const filtered = proxies
    .filter(p => p.https && p.score >= 1)
    .sort(() => Math.random() - 0.5)
    .slice(0, MAX_PROXIES);

  console.log(`🔍 Testing ${filtered.length} proxies (concurrency: ${CONCURRENCY})...\n`);
  console.log(`Target: ${TARGET_URL}\n`);

  const { working } = await runBatch(filtered, CONCURRENCY);

  console.log('\n\n' + '='.repeat(50));
  console.log(`HASIL: ${working.length} proxy berhasil dari ${filtered.length} yang ditest`);

  if (working.length > 0) {
    console.log('\n✅ Working proxies:');
    working.forEach(p => console.log(`  ${p.proxy}`));

    const fs = require('fs');
    fs.writeFileSync(OUTPUT_FILE, working.map(p => p.proxy).join('\n'));
    console.log(`\n💾 Saved to ${OUTPUT_FILE}`);
    console.log('\n📌 Tambahkan ke proxies.txt Boterdrop di VPS:');
    console.log(`   cat ${OUTPUT_FILE} >> ~/Boterdrop-Solver/proxies.txt`);
    console.log('   Lalu edit config.json: "proxy_support": true');
    console.log('   Lalu restart: pm2 restart boterdrop-anibatch');
  } else {
    console.log('\n⚠️  Tidak ada proxy yang berhasil bypass Cloudflare.');
    console.log('   Free proxy kemungkinan sudah di-block Cloudflare.');
    console.log('   Pertimbangkan residential proxy berbayar.');

    // Tampilkan breakdown alasan gagal
    const reasons = {};
    // from results not working
    const allResults = filtered.map((_, i) => ({ reason: 'unknown' }));
    console.log('\n   Rekomendasi: coba Webshare free tier (10 proxy gratis)');
    console.log('   https://www.webshare.io/');
  }
}

main().catch(console.error);
